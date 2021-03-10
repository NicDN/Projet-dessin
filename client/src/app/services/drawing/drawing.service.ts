import { Injectable } from '@angular/core';
import { BoxSize } from '@app/classes/box-size';
import { BaseLineCommand } from '@app/classes/commands/base-line-command';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    blankHTMLImage: HTMLImageElement;
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;

    subject: Subject<BoxSize> = new Subject<BoxSize>();
    baseLineSubject: Subject<BaseLineCommand> = new Subject<BaseLineCommand>();

    sendNotifToResize(boxSize: BoxSize): void {
        this.subject.next(boxSize);
    }

    sendBaseLineCommand(image: HTMLImageElement): void {
        const baseLineCommand = new BaseLineCommand(this, image);
        this.baseLineSubject.next(baseLineCommand);
    }

    newBaseLineSignals(): Observable<BaseLineCommand> {
        return this.baseLineSubject.asObservable();
    }

    newIncomingResizeSignals(): Observable<BoxSize> {
        return this.subject.asObservable();
    }

    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    executeBaseLine(image: HTMLImageElement): void {
        if (image !== undefined) {
            this.baseCtx.drawImage(image, 0, 0);
        }
    }

    handleNewDrawing(image?: HTMLImageElement): void {
        if (this.canvasIsEmpty()) {
            image === undefined ? this.reloadToBlankDrawing() : this.changeDrawing(image);
            return;
        }
        if (this.confirmReload()) {
            image === undefined ? this.reloadToBlankDrawing() : this.changeDrawing(image);
        }
        this.clearCanvas(this.previewCtx);
    }

    changeDrawing(image: HTMLImageElement): void {
        this.sendNotifToResize({ widthBox: image.width, heightBox: image.height });
        this.baseCtx.drawImage(image, 0, 0);
        this.sendBaseLineCommand(image);
    }

    confirmReload(): boolean {
        return window.confirm('Si vous créez un nouveau dessin, vos changements non sauvegardés seront perdus.\n\nVoulez-vous continuer ?');
    }

    reloadToBlankDrawing(): void {
        this.clearCanvas(this.baseCtx);
        this.clearCanvas(this.previewCtx);
        this.fillWithWhite(this.baseCtx);
        this.resetCanvas();

        this.blankHTMLImage.width = this.canvas.width;
        this.blankHTMLImage.height = this.canvas.height;
        this.sendBaseLineCommand(this.blankHTMLImage);
    }

    resetCanvas(): void {
        const boxSize: BoxSize = { widthBox: -1, heightBox: -1 };
        this.sendNotifToResize(boxSize);
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
        this.baseCtx.drawImage(this.previewCanvas, 0, 0);
        this.clearCanvas(this.previewCtx);
    }

    fillWithWhite(context: CanvasRenderingContext2D): void {
        context.fillStyle = 'white';
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // context.drawImage(this.previewCanvas, 0, 0);
    }

    changeSizeOfCanvas(canvas: HTMLCanvasElement, boxsize: BoxSize): void {
        canvas.width = boxsize.widthBox;
        canvas.height = boxsize.heightBox;
    }
}
