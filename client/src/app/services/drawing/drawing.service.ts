import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;

    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    handleNewDrawing(): void {
        if (!this.checkIfCanvasEmpty()) {
            const response = confirm('Si vous créez un nouveau dessin, vos changements seront perdus. Voulez-vous continuer ?');
            if (response === true) {
                this.clearCanvas(this.baseCtx); // This is temporary, we'll have to do smthg else someday ( using server instead );
                this.clearCanvas(this.previewCtx);
            }
        } else {
            this.clearCanvas(this.baseCtx);
            this.clearCanvas(this.previewCtx);
        }
    }

    checkIfCanvasEmpty(): boolean {
        return this.canvas.toDataURL() === this.previewCanvas.toDataURL();
    }
}
