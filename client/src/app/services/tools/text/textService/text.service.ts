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
    Trebuchet,
}

@Injectable({
    providedIn: 'root',
})
export class TextService extends TraceTool {
    readonly MINUS_ONE: number = -1;
    readonly TEXT_MIN_SIZE: number = 10;
    readonly TEXT_MAX_SIZE: number = 70;

    private readonly DEFAULT_SIZE_VALUE: number = 25;
    private readonly MULTIPLIER: number = 1.5;
    private readonly FOURTY: number = 40;
    private readonly ONE_POINT_FIVE: number = 1.5;
    private readonly TWENTY: number = 20;

    textSize: number = this.DEFAULT_SIZE_VALUE;
    textPosition: TextPosition = TextPosition.Left;
    writeItalic: boolean = false;
    writeBold: boolean = false;
    isWriting: boolean = false;
    fontStyle: FontStyle = FontStyle.Arial;
    writtenOnPreview: string = '';
    writingPosition: number = 0; // This value is the offset starting from the end of the current string (writtenOnPreview).
    enterPosition: number[] = [];

    private subject: Subject<boolean> = new Subject<boolean>();
    private longestCharacterChain: Vec2 = { x: 0, y: 0 };
    private initialClickPosition: Vec2 = { x: 0, y: 0 };
    private approximateHeight: number = 0;
    private fontStyleTable: string[] = ['Arial', 'Times', 'Comic Sans MS', 'Calibri', 'Trebuchet MS'];

    constructor(drawingService: DrawingService, colorService: ColorService, private undoRedoService: UndoRedoService) {
        super(drawingService, colorService, 'Texte');
    }

    onMouseDown(event: MouseEvent): void {
        if (this.isWriting === true) {
            if (this.isInsideTextBox(this.getPositionFromMouse(event))) return;
            this.registerTextCommand(this.drawingService.baseCtx, this.writtenOnPreview);
            this.disableWriting();
            this.undoRedoService.enableUndoRedo();
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
        if (!this.isWriting) return;
        this.addChar(event);
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
        if (ctx === this.drawingService.baseCtx && this.writtenOnPreview.length > 0) {
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
        this.approximateHeight = textProperties.textContext.measureText('M').width * this.MULTIPLIER;
        this.findLongestLineAndHeight(textProperties);

        const previewPosition = textProperties.writtenOnPreview.length - this.writingPosition;

        const enterHandled = this.handleEntersWhenWriting(textProperties, previewPosition);
        const i = enterHandled.x;
        const previousPosition = enterHandled.y;
        const asDrawnedPreview = enterHandled.z;

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
    }

    private handleEntersWhenWriting(textProperties: TextProperties, previewPosition: number): { x: number; y: number; z: boolean } {
        let i = 0;
        let previousPosition = 0;
        let asDrawnedPreview = false;

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

        return { x: i, y: previousPosition, z: asDrawnedPreview };
    }

    private findLongestLineAndHeight(textProperties: TextProperties): void {
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
        return (
            this.initialClickPosition.x +
            this.longestCharacterChain.x -
            this.drawingService.previewCtx.measureText(completeCurrentString).width +
            this.drawingService.previewCtx.measureText(text).width
        );
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
}
