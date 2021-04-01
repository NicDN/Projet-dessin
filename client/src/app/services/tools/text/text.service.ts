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

    fontStyle: FontStyle = FontStyle.Arial;
    private writtenOnPreview: string = '';
    private initialClickPosition: Vec2;
    private writingPosition: number = 0; // This value is the offset starting from the end of the current string (writtenOnPreview).
    private fontStyleTable: string[] = ['Arial', 'Times', 'Comic Sans MS', 'Consolas', 'Bembo'];
    private enterPosition: number[] = [];

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
        this.displayPreviewBar(this.drawingService.previewCtx, '', 0);
        this.drawingService.previewCtx.restore();
    }

    onKeyDown(event: KeyboardEvent): void {
        // Maybe making this function a switch case?
        // if (event.key === 'Escape') {
        //     this.disableWriting();
        //     return;
        // }
        // if (event.key === 'ArrowLeft') {
        //     this.arrowLeftPressed();
        // }

        // if (event.key === 'ArrowRight') {
        //     this.arrowRightPressed();
        // }
        // if (event.key === 'ArrowUp') {
        //     this.arrowUpPressed();
        // }
        // if (event.key === 'ArrowDown') {
        //     this.arrowDownPressed();
        // }
        // if (event.key === 'Delete') {
        //     this.deletePressed();
        //     return;
        // }
        // if (event.key === 'Backspace') {
        //     this.backSpacePressed();
        //     return;
        // }
        // if (event.key === 'Enter') {
        //     this.enterPressed();
        // }
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
        // hi
    }

    private arrowDownPressed(): void {
        // hi
    }

    private deletePressed(): void {
        if (this.writingPosition === 0) return;
        const enterDeleted = this.enterPosition.indexOf(this.writtenOnPreview.length - this.writingPosition + 1);
        if (enterDeleted !== this.MINUS_ONE) {
            this.enterPosition.splice(enterDeleted, 1);
        }
        this.writtenOnPreview =
            this.writtenOnPreview.substring(0, this.writtenOnPreview.length - this.writingPosition) +
            this.writtenOnPreview.substring(this.writtenOnPreview.length - this.writingPosition + 1, this.writtenOnPreview.length);
        for (let i = 0; i < this.enterPosition.length; i++) {
            if (this.writtenOnPreview.length - this.writingPosition < this.enterPosition[i]) this.enterPosition[i] -= 1;
        }
        this.writingPosition -= 1;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawText(this.drawingService.previewCtx, this.writtenOnPreview);
    }

    private backSpacePressed(): void {
        const enterDeleted = this.enterPosition.indexOf(this.writtenOnPreview.length - this.writingPosition);
        if (enterDeleted !== this.MINUS_ONE) {
            this.enterPosition.splice(enterDeleted, 1);
        }
        this.writtenOnPreview =
            this.writtenOnPreview.substring(0, this.writtenOnPreview.length - this.writingPosition - 1) +
            this.writtenOnPreview.substring(this.writtenOnPreview.length - this.writingPosition, this.writtenOnPreview.length);
        for (let i = 0; i < this.enterPosition.length; i++) {
            if (this.writtenOnPreview.length - this.writingPosition < this.enterPosition[i]) this.enterPosition[i] -= 1;
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawText(this.drawingService.previewCtx, this.writtenOnPreview);
    }

    private enterPressed(): void {
        this.enterPosition.push(this.writtenOnPreview.length - this.writingPosition + 1);
        this.writtenOnPreview =
            this.writtenOnPreview.substring(0, this.writtenOnPreview.length - this.writingPosition) +
            ' ' +
            this.writtenOnPreview.substring(this.writtenOnPreview.length - this.writingPosition, this.writtenOnPreview.length);
        this.enterPosition.sort((n1, n2) => n1 - n2);
    }

    private addChar(event: KeyboardEvent): void {
        if (event.key.length !== 1 && event.key !== 'Enter' && event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        if (event.key !== 'Enter' && event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
            const writingPosFromStart = this.writtenOnPreview.length - this.writingPosition + 1;
            for (let i = 0; i < this.enterPosition.length; i++) {
                if (writingPosFromStart <= this.enterPosition[i]) this.enterPosition[i] += 1;
            }
            this.writtenOnPreview =
                this.writtenOnPreview.substring(0, this.writtenOnPreview.length - this.writingPosition) +
                event.key +
                this.writtenOnPreview.substring(this.writtenOnPreview.length - this.writingPosition, this.writtenOnPreview.length);
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawText(this.drawingService.previewCtx, this.writtenOnPreview);
    }

    private disableWriting(): void {
        this.isWriting = false;
        this.disableEnableHotKeyService(true);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.writtenOnPreview = '';
        this.writingPosition = 0;
        this.enterPosition = [];
    }

    drawText(ctx: CanvasRenderingContext2D, text: string): void {
        ctx.save();
        this.setContextForWriting(ctx);
        const previewPosition = this.writtenOnPreview.length - this.writingPosition;
        if (this.enterPosition.length !== 0) {
            // You can get a very close approximation of the vertical height by checking the length of a capital M (multiplying by 1.5 for comfort).
            const approximateHeight = ctx.measureText('M').width * this.MULTIPLIER;
            let i = 0;
            let previousPosition = 0;
            for (const position of this.enterPosition) {
                if (previewPosition >= previousPosition && previewPosition < position) {
                    ctx.fillText(
                        this.writtenOnPreview.substring(previousPosition, previewPosition),
                        this.initialClickPosition.x,
                        this.initialClickPosition.y + approximateHeight * i,
                    );
                    this.displayPreviewBar(ctx, text.substring(previousPosition, previewPosition), i * approximateHeight);
                    ctx.fillText(
                        text.substring(previewPosition, position),
                        this.initialClickPosition.x + ctx.measureText(this.writtenOnPreview.substring(previousPosition, previewPosition)).width,
                        this.initialClickPosition.y + approximateHeight * i,
                    );
                } else
                    ctx.fillText(
                        this.writtenOnPreview.substring(previousPosition, position),
                        this.initialClickPosition.x,
                        this.initialClickPosition.y + approximateHeight * i,
                    );
                i += 1;
                previousPosition = position;
            }

            if (previousPosition !== this.writtenOnPreview.length) {
                if (previewPosition >= previousPosition && previewPosition <= this.writtenOnPreview.length) {
                    ctx.fillText(
                        text.substring(previousPosition, previewPosition),
                        this.initialClickPosition.x,
                        this.initialClickPosition.y + approximateHeight * i,
                    );
                    this.displayPreviewBar(ctx, text.substring(previousPosition, previewPosition), approximateHeight * i);
                    ctx.fillText(
                        text.substring(previewPosition, this.writtenOnPreview.length),
                        this.initialClickPosition.x + ctx.measureText(text.substring(previousPosition, previewPosition)).width,
                        this.initialClickPosition.y + approximateHeight * i,
                    );
                } else {
                    ctx.fillText(
                        this.writtenOnPreview.substring(previousPosition, this.writtenOnPreview.length),
                        this.initialClickPosition.x,
                        this.initialClickPosition.y + approximateHeight * i,
                    );
                }
            } else this.displayPreviewBar(ctx, '', approximateHeight * i);
        } else {
            ctx.fillText(text.substring(0, previewPosition), this.initialClickPosition.x, this.initialClickPosition.y);
            this.displayPreviewBar(ctx, text.substring(0, previewPosition), 0);
            ctx.fillText(
                text.substring(previewPosition, text.length),
                this.initialClickPosition.x + ctx.measureText(text.substring(0, previewPosition)).width,
                this.initialClickPosition.y,
            );
        }
        ctx.restore();
    }

    private displayPreviewBar(ctx: CanvasRenderingContext2D, text: string, approximateHeightPadding: number): void {
        if (ctx === this.drawingService.baseCtx) return;
        ctx.fillRect(
            ctx.measureText(text).width + this.initialClickPosition.x,
            // Change the next value to make the bar more centered (bar not the right size for some type of fonts)
            this.initialClickPosition.y - ctx.measureText('M').width + approximateHeightPadding,
            1,
            Math.floor(ctx.measureText('M').width * this.MULTIPLIER),
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
