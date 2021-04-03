import { Injectable } from '@angular/core';
import { TraceTool } from '@app/classes/trace-tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Observable, Subject } from 'rxjs';

export enum TextPositon {
    Center,
    Left,
    Right,
}

export enum FontStyle {
    Arial,
    Times,
    Comic,
    Consolas,
    Bembo,
}

@Injectable({
    providedIn: 'root',
})
export class TextService extends TraceTool {
    readonly TEXT_MIN_SIZE: number = 25;
    readonly TEXT_MAX_SIZE: number = 30;
    readonly MULTIPLIER: number = 1.5;
    readonly MINUS_ONE: number = -1;

    private subject: Subject<boolean> = new Subject<boolean>();

    textSize: number = this.TEXT_MIN_SIZE;
    textPosition: TextPositon = TextPositon.Left;

    writeItalic: boolean = false;
    writeBold: boolean = false;
    isWriting: boolean = false;

    private longestCharacterChain: Vec2 = { x: 0, y: 0 };

    fontStyle: FontStyle = FontStyle.Arial;
    writtenOnPreview: string = '';
    private initialClickPosition: Vec2;
    private writingPosition: number = 0; // This value is the offset starting from the end of the current string (writtenOnPreview).
    private fontStyleTable: string[] = ['Arial', 'Times', 'Comic Sans MS', 'Consolas', 'Bembo'];
    private enterPosition: number[] = [];
    private approximateHeight: number = 0;

    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService, 'Texte');
    }

    onMouseDown(event: MouseEvent): void {
        if (this.isWriting === true) {
            this.drawText(this.drawingService.baseCtx, this.writtenOnPreview);
            this.disableWriting();
            return;
        }
        this.isWriting = true;
        this.disableEnableHotKeyService(false);
        this.initialClickPosition = this.getPositionFromMouse(event);

        this.drawingService.previewCtx.save();
        this.setContextForWriting(this.drawingService.previewCtx);
        this.displayPreviewBar('', 0);
        this.drawingService.previewCtx.restore();
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
            this.drawBox(this.approximateHeight);
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
        this.drawText(this.drawingService.previewCtx, this.writtenOnPreview);
        this.drawBox(this.approximateHeight);
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
        this.drawText(this.drawingService.previewCtx, this.writtenOnPreview);
        this.drawBox(this.approximateHeight);
    }

    private enterPressed(): void {
        this.enterPosition.push(this.writtenOnPreview.length - this.writingPosition + 1);

        this.changeWrittenOnPreview(' ', 0, 0);
        this.enterPosition.sort((n1, n2) => n1 - n2);
        const writingPosFromStart = this.writtenOnPreview.length - this.writingPosition + 1;
        for (let i = 0; i < this.enterPosition.length; i++) {
            if (writingPosFromStart <= this.enterPosition[i]) this.enterPosition[i] += 1;
        }
    }

    private addChar(event: KeyboardEvent): void {
        const exceptions =
            event.key !== 'Enter' && event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'ArrowUp' && event.key !== 'ArrowDown';
        if (event.key.length !== 1 && exceptions) return;
        if (event.key !== 'Enter' && exceptions) {
            const writingPosFromStart = this.writtenOnPreview.length - this.writingPosition + 1;
            for (let i = 0; i < this.enterPosition.length; i++) {
                if (writingPosFromStart <= this.enterPosition[i]) this.enterPosition[i] += 1;
            }
            this.changeWrittenOnPreview(event.key, 0, 0);
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawText(this.drawingService.previewCtx, this.writtenOnPreview);
    }

    changeWrittenOnPreview(char: string, offset1: number, offset2: number): void {
        this.writtenOnPreview =
            this.writtenOnPreview.substring(0, this.writtenOnPreview.length - this.writingPosition + offset1) +
            char +
            this.writtenOnPreview.substring(this.writtenOnPreview.length - this.writingPosition + offset2, this.writtenOnPreview.length);
    }

    private disableWriting(): void {
        this.isWriting = false;
        this.disableEnableHotKeyService(true);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.writtenOnPreview = '';
        this.writingPosition = 0;
        this.enterPosition = [];
        this.longestCharacterChain = { x: 0, y: 0 };
    }

    drawText(ctx: CanvasRenderingContext2D, text: string): void {
        this.longestCharacterChain = { x: 0, y: 0 };
        ctx.save();
        this.setContextForWriting(ctx);
        const previewPosition = this.writtenOnPreview.length - this.writingPosition;
        let asDrawnedPreview = false;
        // You can get a very close approximation of the vertical height by checking the length of a capital M (multiplying by 1.5 for comfort).
        this.approximateHeight = ctx.measureText('M').width * this.MULTIPLIER;
        let i = 0;
        let previousPosition = 0;

        // this.enterPosition.forEach((position, index) => {
        // });
        if (this.enterPosition.length === 0) {
            this.boxSizeX(ctx, 0, this.writtenOnPreview.length - 1);
        }
        for (const position of this.enterPosition) {
            this.boxSizeX(ctx, previousPosition, position);
            if (previewPosition >= previousPosition && previewPosition < position) {
                this.writeText(ctx, previousPosition, position, this.approximateHeight * i);
                this.displayPreviewBar(text.substring(previousPosition, previewPosition), i * this.approximateHeight);
                asDrawnedPreview = true;
            } else this.writeText(ctx, previousPosition, position, this.approximateHeight * i);
            i += 1;
            previousPosition = position;
        }
        this.longestCharacterChain.y = this.approximateHeight * i;

        if (previousPosition !== this.writtenOnPreview.length) {
            this.boxSizeX(ctx, previousPosition - 2, this.writtenOnPreview.length - 1);
            if (previewPosition >= previousPosition && previewPosition <= this.writtenOnPreview.length) {
                this.writeText(ctx, previousPosition, this.writtenOnPreview.length, this.approximateHeight * i);
                this.displayPreviewBar(text.substring(previousPosition, previewPosition), this.approximateHeight * i);
            } else {
                this.writeText(ctx, previousPosition, this.writtenOnPreview.length, this.approximateHeight * i);
            }
        } else {
            if (!asDrawnedPreview) this.displayPreviewBar('', this.approximateHeight * i);
        }
        ctx.restore();
    }

    drawBox(approximateHeight: number): void {
        console.clear();
        console.table(this.longestCharacterChain);
        this.drawingService.previewCtx.save();
        this.drawingService.previewCtx.beginPath();
        this.drawingService.previewCtx.rect(
            this.initialClickPosition.x - 10,
            this.initialClickPosition.y - approximateHeight,
            this.longestCharacterChain.x + 30,
            this.longestCharacterChain.y + approximateHeight + 20,
        );
        this.drawingService.previewCtx.stroke();
        this.drawingService.previewCtx.closePath();
        this.drawingService.previewCtx.restore();
    }

    private boxSizeX(ctx: CanvasRenderingContext2D, startingPos: number, endingPos: number): void {
        const lineWidth = ctx.measureText(this.writtenOnPreview.substring(startingPos, endingPos)).width;
        if (this.longestCharacterChain.x < lineWidth) this.longestCharacterChain.x = lineWidth;
    }

    private writeText(ctx: CanvasRenderingContext2D, begin: number, end: number, height: number): void {
        ctx.fillText(this.writtenOnPreview.substring(begin, end), this.initialClickPosition.x, this.initialClickPosition.y + height);
    }

    private displayPreviewBar(text: string, approximateHeightPadding: number): void {
        this.drawingService.previewCtx.fillRect(
            this.drawingService.previewCtx.measureText(text).width + this.initialClickPosition.x,
            // Change the next value to make the bar more centered (bar not the right size for some type of fonts)
            this.initialClickPosition.y - this.drawingService.previewCtx.measureText('M').width + approximateHeightPadding,
            1,
            Math.floor(this.drawingService.previewCtx.measureText('M').width * this.MULTIPLIER),
        );
    }

    private setContextForWriting(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.colorService.mainColor.rgbValue;
        ctx.globalAlpha = this.colorService.mainColor.opacity;
        let writingType: string;
        if (this.writeBold && this.writeItalic) writingType = 'italic bold';
        else if (this.writeBold) writingType = 'bold';
        else if (this.writeItalic) writingType = 'italic';
        else writingType = 'normal';
        ctx.font = writingType + ' ' + this.textSize + 'px ' + this.fontStyleTable[this.fontStyle];
    }

    private disableEnableHotKeyService(bool: boolean): void {
        this.subject.next(bool);
    }

    disableEnableKeyEvents(): Observable<boolean> {
        return this.subject.asObservable();
    }
}
