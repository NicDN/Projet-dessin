import { Injectable } from '@angular/core';
import { TextCommand, TextProperties } from '@app/classes/commands/text-command/text-command';
import { TraceTool } from '@app/classes/trace-tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Observable, Subject } from 'rxjs';

export enum TextPosition {
    Center,
    Left,
    Right,
}

export enum FontStyle {
    Arial,
    Times,
    Comic,
    Calibri,
    Georgia,
}

@Injectable({
    providedIn: 'root',
})
export class TextService extends TraceTool {
    readonly TEXT_MIN_SIZE: number = 10;
    readonly TEXT_MAX_SIZE: number = 50;
    readonly MULTIPLIER: number = 1.5;
    readonly MINUS_ONE: number = -1;
    readonly FOURTY: number = 40;
    readonly ONE_POINT_FIVE: number = 1.5;
    readonly TWENTY: number = 20;

    private subject: Subject<boolean> = new Subject<boolean>();

    textSize: number = this.TEXT_MIN_SIZE;
    textPosition: TextPosition = TextPosition.Left;

    writeItalic: boolean = false;
    writeBold: boolean = false;
    isWriting: boolean = false;

    private longestCharacterChain: Vec2 = { x: 0, y: 0 };

    fontStyle: FontStyle = FontStyle.Arial;
    writtenOnPreview: string = '';
    private initialClickPosition: Vec2 = { x: 0, y: 0 };
    writingPosition: number = 0; // This value is the offset starting from the end of the current string (writtenOnPreview).
    private fontStyleTable: string[] = ['Arial', 'Times', 'Comic Sans MS', 'Calibri', 'Georgia'];
    enterPosition: number[] = [];
    private approximateHeight: number = 0;

    constructor(drawingService: DrawingService, colorService: ColorService, private undoRedoService: UndoRedoService) {
        super(drawingService, colorService, 'Texte');
    }

    onMouseDown(event: MouseEvent): void {
        if (this.isWriting === true) {
            if (!this.isInsideTextBox(this.getPositionFromMouse(event))) {
                this.registerTextCommand(this.drawingService.baseCtx, this.writtenOnPreview);
                this.disableWriting();
                this.undoRedoService.enableUndoRedo();
            }
            return;
        }
        this.isWriting = true;
        this.undoRedoService.disableUndoRedo();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.disableEnableHotKeyService(false);
        this.initialClickPosition = this.getPositionFromMouse(event);

        this.drawingService.previewCtx.save();
        this.setContextForWriting(this.loadTextProperties(this.drawingService.previewCtx, ''));
        this.displayPreviewBar(this.loadTextProperties(this.drawingService.previewCtx, '').textContext, '', 0, '');
        this.drawBox();
        this.drawingService.previewCtx.restore();
    }

    private isInsideTextBox(point: Vec2): boolean {
        return (
            point.x > this.initialClickPosition.x - this.TWENTY &&
            point.x <
                this.initialClickPosition.x +
                    this.longestCharacterChain.x +
                    (this.textSize * this.ONE_POINT_FIVE < this.FOURTY ? this.FOURTY : this.textSize * this.ONE_POINT_FIVE) -
                    this.TWENTY &&
            point.y > this.initialClickPosition.y - this.approximateHeight &&
            point.y < this.initialClickPosition.y + this.longestCharacterChain.y + this.textSize
        );
    }

    onKeyDown(event: KeyboardEvent): void {
        switch (event.code) {
            case 'Escape':
                this.disableWriting();
                return;
            case 'ArrowLeft':
                this.arrowLeftPressed();
                break;
            case 'ArrowRight':
                this.arrowRightPressed();
                break;
            case 'ArrowUp':
                this.arrowUpPressed();
                break;
            case 'ArrowDown':
                this.arrowDownPressed();
                break;
            case 'Delete':
                this.deletePressed();
                return;
            case 'Backspace':
                this.backSpacePressed();
                return;
            case 'Enter':
                this.enterPressed();
                break;
            default:
                break;
        }
        if (this.isWriting) {
            this.addChar(event);
        }
    }

    private arrowLeftPressed(): void {
        if (this.writingPosition !== this.writtenOnPreview.length) this.writingPosition += 1;
    }

    private arrowRightPressed(): void {
        if (this.writingPosition !== 0) this.writingPosition -= 1;
    }

    private arrowUpPressed(): void {
        let closestEnterPos = -1;
        let index = -1;
        for (const enter of this.enterPosition) {
            if (this.writtenOnPreview.length - enter >= this.writingPosition) {
                closestEnterPos = enter;
                index++;
            }
        }

        if (closestEnterPos === this.MINUS_ONE) return;
        if (index === 0) {
            this.writingPosition += closestEnterPos;
            if (this.writtenOnPreview.length - closestEnterPos >= this.writingPosition) {
                this.writingPosition = this.writtenOnPreview.length - closestEnterPos + 1;
            }
            return;
        }
        this.writingPosition += closestEnterPos - this.enterPosition[this.enterPosition.indexOf(closestEnterPos) - 1];
        if (this.writtenOnPreview.length - closestEnterPos >= this.writingPosition) {
            this.writingPosition = this.writtenOnPreview.length - closestEnterPos + 1;
        }
    }

    private arrowDownPressed(): void {
        let closestEnterPos = -1;
        let index = -1;
        for (const enter of this.enterPosition) {
            index++;
            if (this.writtenOnPreview.length - enter < this.writingPosition) {
                closestEnterPos = enter;
                break;
            }
        }
        if (closestEnterPos === this.MINUS_ONE) return;
        if (index === 0) {
            this.writingPosition -= closestEnterPos;
            if (0 > this.writingPosition) {
                this.writingPosition = 0;
            }
            if (this.writingPosition <= this.writtenOnPreview.length - this.enterPosition[this.enterPosition.indexOf(closestEnterPos) + 1]) {
                this.writingPosition = this.writtenOnPreview.length - this.enterPosition[this.enterPosition.indexOf(closestEnterPos) + 1] + 1;
            }
            return;
        }

        this.writingPosition -= closestEnterPos - this.enterPosition[this.enterPosition.indexOf(closestEnterPos) - 1];
        if (0 > this.writingPosition) {
            this.writingPosition = 0;
            return;
        }
        if (this.writingPosition <= this.writtenOnPreview.length - this.enterPosition[this.enterPosition.indexOf(closestEnterPos) + 1]) {
            this.writingPosition = this.writtenOnPreview.length - this.enterPosition[this.enterPosition.indexOf(closestEnterPos) + 1] + 1;
        }
    }

    private deletePressed(): void {
        if (this.writingPosition === 0) return;
        const enterDeleted = this.enterPosition.indexOf(this.writtenOnPreview.length - this.writingPosition + 1);
        if (enterDeleted !== this.MINUS_ONE) this.enterPosition.splice(enterDeleted, 1);

        this.changeWrittenOnPreview('', 0, 1);
        for (let i = 0; i < this.enterPosition.length; i++) {
            if (this.writtenOnPreview.length - this.writingPosition + 1 < this.enterPosition[i]) {
                this.enterPosition[i] -= 1;
            }
        }
        this.writingPosition -= 1;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.registerTextCommand(this.drawingService.previewCtx, this.writtenOnPreview);
        this.drawBox();
    }

    private backSpacePressed(): void {
        if (this.writingPosition === this.writtenOnPreview.length) return;
        const enterDeleted = this.enterPosition.indexOf(this.writtenOnPreview.length - this.writingPosition);
        if (enterDeleted !== this.MINUS_ONE) this.enterPosition.splice(enterDeleted, 1);
        this.changeWrittenOnPreview('', this.MINUS_ONE, 0);
        for (let i = 0; i < this.enterPosition.length; i++) {
            if (this.writtenOnPreview.length - this.writingPosition < this.enterPosition[i]) this.enterPosition[i] -= 1;
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.registerTextCommand(this.drawingService.previewCtx, this.writtenOnPreview);
        this.drawBox();
    }

    private enterPressed(): void {
        this.enterPosition.push(this.writtenOnPreview.length - this.writingPosition + 1);

        this.changeWrittenOnPreview(' ', 0, 0);
        this.enterPosition.sort((n1, n2) => n1 - n2);
        const writingPosFromStart = this.writtenOnPreview.length - this.writingPosition + 1;
        let lastValue = -1;
        for (let i = 0; i < this.enterPosition.length; i++) {
            if (writingPosFromStart <= this.enterPosition[i] || this.enterPosition[i] === lastValue) this.enterPosition[i] += 1;
            lastValue = this.enterPosition[i];
        }
    }

    private addChar(event: KeyboardEvent): void {
        const notExceptions =
            event.key !== 'Enter' && event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'ArrowUp' && event.key !== 'ArrowDown';
        if (event.key.length !== 1 && notExceptions) return;
        if (event.key !== 'Enter' && notExceptions) {
            const writingPosFromStart = this.writtenOnPreview.length - this.writingPosition + 1;
            for (let i = 0; i < this.enterPosition.length; i++) {
                if (writingPosFromStart <= this.enterPosition[i]) this.enterPosition[i] += 1;
            }
            this.changeWrittenOnPreview(event.key, 0, 0);
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.registerTextCommand(this.drawingService.previewCtx, this.writtenOnPreview);
        this.drawBox();
    }

    changeWrittenOnPreview(char: string, offset1: number, offset2: number): void {
        this.writtenOnPreview =
            this.writtenOnPreview.substring(0, this.writtenOnPreview.length - this.writingPosition + offset1) +
            char +
            this.writtenOnPreview.substring(this.writtenOnPreview.length - this.writingPosition + offset2, this.writtenOnPreview.length);
    }

    disableWriting(): void {
        this.isWriting = false;
        this.disableEnableHotKeyService(true);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.writtenOnPreview = '';
        this.writingPosition = 0;
        this.enterPosition = [];
        this.longestCharacterChain = { x: 0, y: 0 };
    }

    registerTextCommand(ctx: CanvasRenderingContext2D, text: string): void {
        const textCommand = new TextCommand(this, this.loadTextProperties(ctx, text));
        textCommand.execute();
        if (ctx === this.drawingService.baseCtx) {
            this.undoRedoService.addCommand(textCommand);
        }
    }

    loadTextProperties(ctx: CanvasRenderingContext2D, text: string): TextProperties {
        return {
            textContext: ctx,
            initialClickPosition: this.initialClickPosition,
            writtenOnPreview: text,
            enterPosition: this.enterPosition,
            fontStyle: this.fontStyle,
            writeBold: this.writeBold,
            writeItalic: this.writeItalic,
            textSize: this.textSize,
            textPosition: this.textPosition,
            color: { rgbValue: this.colorService.mainColor.rgbValue, opacity: this.colorService.mainColor.opacity },
        };
    }

    drawText(textProperties: TextProperties): void {
        this.longestCharacterChain = { x: 0, y: 0 };
        textProperties.textContext.save();
        this.setContextForWriting(textProperties);
        this.findLongestLineAndHeight(textProperties);

        const previewPosition = textProperties.writtenOnPreview.length - this.writingPosition;
        let asDrawnedPreview = false;
        // You can get a very close approximation of the vertical height by checking the length of a capital M (multiplying by 1.5 for comfort).
        this.approximateHeight = textProperties.textContext.measureText('M').width * this.MULTIPLIER;
        let i = 0;
        let previousPosition = 0;

        for (const position of textProperties.enterPosition) {
            if (previewPosition >= previousPosition && previewPosition < position) {
                this.writeText(textProperties, previousPosition, position - 1, this.approximateHeight * i);
                this.displayPreviewBar(
                    textProperties.textContext,
                    textProperties.writtenOnPreview.substring(previousPosition, previewPosition),
                    this.approximateHeight * i,
                    textProperties.writtenOnPreview.substring(previousPosition, position - 1),
                );
                asDrawnedPreview = true;
            } else this.writeText(textProperties, previousPosition, position - 1, this.approximateHeight * i);
            i += 1;
            previousPosition = position;
        }

        if (previousPosition !== textProperties.writtenOnPreview.length) {
            if (previewPosition >= previousPosition && previewPosition <= textProperties.writtenOnPreview.length) {
                this.writeText(textProperties, previousPosition, textProperties.writtenOnPreview.length, this.approximateHeight * i);
                this.displayPreviewBar(
                    textProperties.textContext,
                    textProperties.writtenOnPreview.substring(previousPosition, previewPosition),
                    this.approximateHeight * i,
                    textProperties.writtenOnPreview.substring(previousPosition, textProperties.writtenOnPreview.length),
                );
            } else {
                this.writeText(textProperties, previousPosition, textProperties.writtenOnPreview.length, this.approximateHeight * i);
            }
        } else {
            if (!asDrawnedPreview)
                this.displayPreviewBar(
                    textProperties.textContext,
                    '',
                    this.approximateHeight * i,
                    textProperties.writtenOnPreview.substring(previousPosition, textProperties.writtenOnPreview.length),
                );
        }
        textProperties.textContext.restore();

        if (textProperties.textContext === this.drawingService.baseCtx) {
            this.disableWriting();
        }
    }

    findLongestLineAndHeight(textProperties: TextProperties): void {
        if (textProperties.enterPosition.length === 0) {
            this.boxSizeX(textProperties, 0, textProperties.writtenOnPreview.length - 1);
            return;
        }
        let previousPosition = 0;
        let i = 0;
        for (const position of textProperties.enterPosition) {
            this.boxSizeX(textProperties, previousPosition, position);
            i += 1;
            previousPosition = position;
        }
        this.longestCharacterChain.y = this.approximateHeight * i;
        if (previousPosition !== textProperties.writtenOnPreview.length)
            this.boxSizeX(textProperties, previousPosition - 2, textProperties.writtenOnPreview.length - 1);
    }

    drawBox(): void {
        if (this.approximateHeight === 0) this.approximateHeight = this.drawingService.previewCtx.measureText('M').width * this.MULTIPLIER;

        this.drawingService.previewCtx.save();
        this.drawingService.previewCtx.strokeStyle = 'black';
        this.drawingService.previewCtx.lineWidth = 1;
        this.drawingService.previewCtx.beginPath();
        this.drawingService.previewCtx.rect(
            this.initialClickPosition.x - this.TWENTY,
            this.initialClickPosition.y - this.approximateHeight,
            this.longestCharacterChain.x + (this.textSize * this.ONE_POINT_FIVE < this.FOURTY ? this.FOURTY : this.textSize * this.ONE_POINT_FIVE),
            this.longestCharacterChain.y + this.approximateHeight + this.textSize,
        );
        this.drawingService.previewCtx.setLineDash([this.TEXT_MIN_SIZE, this.TEXT_MIN_SIZE / 2]);
        this.drawingService.previewCtx.stroke();
        this.drawingService.previewCtx.closePath();
        this.drawingService.previewCtx.restore();
    }

    private boxSizeX(textProperties: TextProperties, startingPos: number, endingPos: number): void {
        const lineWidth = textProperties.textContext.measureText(textProperties.writtenOnPreview.substring(startingPos, endingPos)).width;
        if (this.longestCharacterChain.x < lineWidth) this.longestCharacterChain.x = lineWidth;
    }

    private writeText(textProperties: TextProperties, begin: number, end: number, height: number): void {
        if (textProperties.textPosition === TextPosition.Center && textProperties.enterPosition.length !== 0) {
            const centerOffSet =
                textProperties.initialClickPosition.x +
                this.longestCharacterChain.x / 2 -
                textProperties.textContext.measureText(textProperties.writtenOnPreview.substring(begin, end)).width / 2;
            textProperties.textContext.fillText(
                textProperties.writtenOnPreview.substring(begin, end),
                centerOffSet,
                textProperties.initialClickPosition.y + height,
            );
            return;
        }
        if (textProperties.textPosition === TextPosition.Right && textProperties.enterPosition.length !== 0) {
            const rightOffSet =
                textProperties.initialClickPosition.x +
                this.longestCharacterChain.x -
                textProperties.textContext.measureText(textProperties.writtenOnPreview.substring(begin, end)).width;
            textProperties.textContext.fillText(
                textProperties.writtenOnPreview.substring(begin, end),
                rightOffSet,
                textProperties.initialClickPosition.y + height,
            );
            return;
        }
        textProperties.textContext.fillText(
            textProperties.writtenOnPreview.substring(begin, end),
            textProperties.initialClickPosition.x,
            textProperties.initialClickPosition.y + height,
        );
    }

    private displayPreviewBar(ctx: CanvasRenderingContext2D, text: string, approximateHeightPadding: number, completeCurrentString: string): void {
        if (ctx === this.drawingService.baseCtx) return;
        this.drawingService.previewCtx.fillStyle = 'black';
        this.drawingService.previewCtx.fillRect(
            this.currentPositionX(text, completeCurrentString),
            this.initialClickPosition.y - this.drawingService.previewCtx.measureText('M').width + approximateHeightPadding,
            1,
            Math.floor(this.drawingService.previewCtx.measureText('M').width * this.MULTIPLIER),
        );
        this.drawingService.previewCtx.fillStyle = this.colorService.mainColor.rgbValue;
    }

    private currentPositionX(text: string, completeCurrentString: string): number {
        if (this.textPosition === TextPosition.Left || this.enterPosition.length === 0)
            return this.drawingService.previewCtx.measureText(text).width + this.initialClickPosition.x;
        if (this.textPosition === TextPosition.Center)
            return (
                this.initialClickPosition.x +
                this.longestCharacterChain.x / 2 -
                this.drawingService.previewCtx.measureText(completeCurrentString).width / 2 +
                this.drawingService.previewCtx.measureText(text).width
            );
        if (this.textPosition === TextPosition.Right)
            return (
                this.initialClickPosition.x +
                this.longestCharacterChain.x -
                this.drawingService.previewCtx.measureText(completeCurrentString).width +
                this.drawingService.previewCtx.measureText(text).width
            );

        return 0;
    }

    private setContextForWriting(textProperties: TextProperties): void {
        textProperties.textContext.fillStyle = textProperties.color.rgbValue;
        textProperties.textContext.globalAlpha = textProperties.color.opacity;
        let writingType: string;
        if (textProperties.writeBold && textProperties.writeItalic) writingType = 'italic bold';
        else if (textProperties.writeBold) writingType = 'bold';
        else if (textProperties.writeItalic) writingType = 'italic';
        else writingType = 'normal';
        textProperties.textContext.font = writingType + ' ' + textProperties.textSize + 'px ' + this.fontStyleTable[textProperties.fontStyle];
    }

    private disableEnableHotKeyService(bool: boolean): void {
        this.subject.next(bool);
    }

    disableEnableKeyEvents(): Observable<boolean> {
        return this.subject.asObservable();
    }
    // tslint:disable-next-line: max-file-line-count
}
