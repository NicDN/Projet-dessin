import { Injectable } from '@angular/core';
import { BoxSize } from '@app/classes/box-size';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;

    private subject: Subject<void> = new Subject<void>();

    sendNotifReload(): void {
        this.subject.next();
    }

    newIncomingResizeSignals(): Observable<void> {
        return this.subject.asObservable();
    }

    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    handleNewDrawing(): void {
        if (this.canvasIsEmpty()) {
            this.reloadDrawing();
            return;
        }
        if (this.confirmReload()) {
            this.reloadDrawing();
        }
    }

    confirmReload(): boolean {
        return window.confirm('Si vous créez un nouveau dessin, vos changements non sauvegardés seront perdus.\n\nVoulez-vous continuer ?');
    }

    reloadDrawing(): void {
        this.clearCanvas(this.baseCtx);
        this.clearCanvas(this.previewCtx);
        this.baseCtx.save();
        this.baseCtx.fillStyle = 'white';
        this.baseCtx.fillRect(0,0, this.canvas.width, this.canvas.height);
        this.baseCtx.restore();
        this.resetCanvas();
    }

    resetCanvas(): void {
        this.sendNotifReload();
    }

    canvasIsEmpty(): boolean {
        this.clearCanvas(this.previewCtx); // Necessary to clear preview in case there there is the eraser preview or something else
        return this.canvas.toDataURL() === this.previewCanvas.toDataURL();
    }

    onSizeChange(boxsize: BoxSize): void {
        this.changeSizeOfCanvas(this.previewCanvas, boxsize);
        this.previewCtx.drawImage(this.canvas, 0, 0);
        this.changeSizeOfCanvas(this.canvas, boxsize);
        this.baseCtx.drawImage(this.previewCanvas, 0, 0);
        this.clearCanvas(this.previewCtx);
    }

    changeSizeOfCanvas(canvas: HTMLCanvasElement, boxsize: BoxSize): void {
        canvas.width = boxsize.widthBox;
        canvas.height = boxsize.heightBox;
    }
}
