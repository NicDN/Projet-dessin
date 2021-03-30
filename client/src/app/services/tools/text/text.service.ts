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

    private subject: Subject<boolean> = new Subject<boolean>();

    textSize: number = this.TEXT_MIN_SIZE;
    textPosition: TextPositon = TextPositon.Left;

    writeItalic: boolean = false;
    writeBold: boolean = false;
    isWriting: boolean = false;

    fontStyle: FontStyle = FontStyle.Arial;
    private writtenOnPreview: string = '';
    private initialClickPosition: Vec2;
    private writingPosition: number = 0;

    private fontStyleTable: string[] = ['Arial', 'Times', 'Comic Sans MS', 'Consolas', 'Bembo'];

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
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.disableWriting();
            return;
        }

        if (event.key === 'ArrowLeft') {
            if (this.writingPosition !== this.writtenOnPreview.length) this.writingPosition += 1;
        }

        if (event.key === 'ArrowRight') {
            if (this.writingPosition !== 0) this.writingPosition -= 1;
        }

        if (event.key === 'Delete') {
            if (this.writingPosition === 0) return;
            this.writtenOnPreview =
                this.writtenOnPreview.substring(0, this.writtenOnPreview.length - this.writingPosition) +
                this.writtenOnPreview.substring(this.writtenOnPreview.length - this.writingPosition + 1, this.writtenOnPreview.length);
            this.writingPosition -= 1;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawText(this.drawingService.previewCtx, this.writtenOnPreview);
            return;
        }

        if (event.key === 'Backspace') {
            this.writtenOnPreview =
                this.writtenOnPreview.substring(0, this.writtenOnPreview.length - this.writingPosition - 1) +
                this.writtenOnPreview.substring(this.writtenOnPreview.length - this.writingPosition, this.writtenOnPreview.length);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawText(this.drawingService.previewCtx, this.writtenOnPreview);
            return;
        }

        if (this.isWriting) {
            if (event.key.length !== 1) return;
            this.writtenOnPreview =
                this.writtenOnPreview.substring(0, this.writtenOnPreview.length - this.writingPosition) +
                event.key +
                this.writtenOnPreview.substring(this.writtenOnPreview.length - this.writingPosition, this.writtenOnPreview.length);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawText(this.drawingService.previewCtx, this.writtenOnPreview);
        }
    }

    private disableWriting(): void {
        this.isWriting = false;
        this.disableEnableHotKeyService(true);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.writtenOnPreview = '';
        this.writingPosition = 0;
    }

    drawText(ctx: CanvasRenderingContext2D, text: string): void {
        ctx.save();
        this.setContextForWriting(ctx);
        ctx.fillText(text, this.initialClickPosition.x, this.initialClickPosition.y);
        ctx.restore();
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
