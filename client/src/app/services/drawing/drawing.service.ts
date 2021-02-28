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

    private subject: Subject<BoxSize> = new Subject<BoxSize>();

    sendNotifToResize(boxSize?: BoxSize): void {
        this.subject.next(boxSize);
    }

    newIncomingResizeSignals(): Observable<BoxSize> {
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
        this.clearCanvas(this.previewCtx);
    }

    confirmReload(): boolean {
        return window.confirm('Si vous créez un nouveau dessin, vos changements non sauvegardés seront perdus.\n\nVoulez-vous continuer ?');
    }

    reloadDrawing(): void {
        this.clearCanvas(this.baseCtx);
        this.clearCanvas(this.previewCtx);
        this.fillWithWhite(this.baseCtx);
        this.resetCanvas();
    }

    resetCanvas(): void {
        this.sendNotifToResize();
    }

    canvasIsEmpty(): boolean {
        this.fillWithWhite(this.previewCtx); // Necessary to clear preview in case there there is the eraser preview or something else
        return this.canvas.toDataURL() === this.previewCanvas.toDataURL();
    }

    onSizeChange(boxsize: BoxSize): void {
        this.changeSizeOfCanvas(this.previewCanvas, boxsize);
        this.previewCtx.drawImage(this.canvas, 0, 0);
        this.changeSizeOfCanvas(this.canvas, boxsize);
        this.fillWithWhite(this.baseCtx);

        this.clearCanvas(this.previewCtx);
    }

    fillWithWhite(context: CanvasRenderingContext2D): void {
        context.fillStyle = 'white';
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        context.drawImage(this.previewCanvas, 0, 0);
    }

    changeSizeOfCanvas(canvas: HTMLCanvasElement, boxsize: BoxSize): void {
        canvas.width = boxsize.widthBox;
        canvas.height = boxsize.heightBox;
    }
}
