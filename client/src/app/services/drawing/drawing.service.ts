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

    private subject: Subject<string> = new Subject<string>();

    sendNotifReload(message: string): void {
        this.subject.next(message);
    }

    getMessage(): Observable<string> {
        return this.subject.asObservable();
    }

    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    handleNewDrawing(): void {
        if (!this.checkIfCanvasEmpty()) {
            if (this.validateUserInput()) {
                this.reloadDrawing();
            }
        } else {
            this.reloadDrawing();
        }
    }

    validateUserInput(): boolean {
        return window.confirm('Si vous créez un nouveau dessin, vos changements non sauvegardés seront perdus.\n\nVoulez-vous continuer ?');
    }

    reloadDrawing(): void {
        this.clearCanvas(this.baseCtx);
        this.clearCanvas(this.previewCtx);
        this.resetCanvas();
    }

    resetCanvas(): void {
        this.sendNotifReload('Resizing the canvas');
    }

    resizeCanvas(): void {
        this.sendNotifReload('Plz reload');
    }

    checkIfCanvasEmpty(): boolean {
        this.clearCanvas(this.previewCtx);
        return this.canvas.toDataURL() === this.previewCanvas.toDataURL();
    }

    // Last to test
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
