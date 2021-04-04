import { Injectable } from '@angular/core';
import { BoxSize } from '@app/classes/box-size';
import { BaseLineCommand } from '@app/classes/commands/base-line-command/base-line-command';
import { Observable, Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    blankHTMLImage: HTMLImageElement;
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    gridCtx: CanvasRenderingContext2D;

    gridCanvas: HTMLCanvasElement;
    canvas: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;
    isNewDrawing: boolean = false;

    newImage?: HTMLImageElement = undefined;
    isStamp: boolean = false;

    private subject: Subject<BoxSize> = new Subject<BoxSize>();
    private baseLineSubject: Subject<BaseLineCommand> = new Subject<BaseLineCommand>();
    private gridSubject: Subject<void> = new Subject<void>();

    sendNotifToResize(boxSize: BoxSize): void {
        this.subject.next(boxSize);
    }

    updateGrid(): void {
        this.gridSubject.next();
    }

    newGridSignals(): Observable<void> {
        return this.gridSubject.asObservable();
    }

    private sendBaseLineCommand(image: HTMLImageElement): void {
        const baseLineCommand = new BaseLineCommand(this, image);
        this.clearCanvas(this.previewCtx);
        this.clearCanvas(this.baseCtx);
        baseLineCommand.execute();
        this.baseLineSubject.next(baseLineCommand);
    }

    newBaseLineSignals(): Observable<BaseLineCommand> {
        return this.baseLineSubject.asObservable();
    }

    newIncomingResizeSignals(): Observable<BoxSize> {
        return this.subject.asObservable();
    }

    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    }

    executeBaseLine(image: HTMLImageElement): void {
        if (image.width > 0 && image.height > 0) {
            this.baseCtx.drawImage(image, 0, 0);
        }
    }

    handleNewDrawing(image?: HTMLImageElement): boolean {
        let confirm = false;
        if (this.canvasIsEmpty()) {
            image === undefined ? this.reloadToBlankDrawing() : this.changeDrawing(image);
            return true;
        }
        if (this.confirmReload()) {
            confirm = true;
            image === undefined ? this.reloadToBlankDrawing() : this.changeDrawing(image);
        }
        this.clearCanvas(this.previewCtx);

        return confirm;
    }

    changeDrawing(image: HTMLImageElement): void {
        this.sendNotifToResize({ widthBox: image.width, heightBox: image.height });
        this.baseCtx.drawImage(image, 0, 0);
        this.sendBaseLineCommand(image);
    }

    private confirmReload(): boolean {
        return window.confirm('Si vous créez un nouveau dessin, vos changements non sauvegardés seront perdus.\n\nVoulez-vous continuer ?');
    }

    private reloadToBlankDrawing(): void {
        this.clearCanvas(this.baseCtx);
        this.clearCanvas(this.previewCtx);
        this.resetCanvas();

        this.blankHTMLImage.width = this.canvas.width;
        this.blankHTMLImage.height = this.canvas.height;
        this.sendBaseLineCommand(this.blankHTMLImage);
    }

    private resetCanvas(): void {
        const boxSize: BoxSize = { widthBox: -1, heightBox: -1 };
        this.sendNotifToResize(boxSize);
    }

    private canvasIsEmpty(): boolean {
        this.fillWithWhite(this.previewCtx); // Necessary to clear preview in case the eraser preview box or something else is using the preview
        return this.canvas.toDataURL() === this.previewCanvas.toDataURL();
    }

    onSizeChange(boxsize: BoxSize): void {
        if (!this.isStamp) {
            const imageOldPreview = this.previewCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.swapDrawings(boxsize);
            this.previewCtx.putImageData(imageOldPreview, 0, 0);
        } else {
            this.swapDrawings(boxsize);
        }
    }

    private swapDrawings(boxsize: BoxSize): void {
        this.changeSizeOfCanvas(this.previewCanvas, boxsize);
        this.previewCtx.drawImage(this.canvas, 0, 0);
        this.changeSizeOfCanvas(this.canvas, boxsize);
        this.fillWithWhite(this.baseCtx);
        this.baseCtx.drawImage(this.previewCanvas, 0, 0);
        this.clearCanvas(this.previewCtx);

        this.clearCanvas(this.gridCtx);
        this.updateGrid();
    }

    fillWithWhite(context: CanvasRenderingContext2D): void {
        context.fillStyle = 'white';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }

    private changeSizeOfCanvas(canvas: HTMLCanvasElement, boxsize: BoxSize): void {
        canvas.width = boxsize.widthBox;
        canvas.height = boxsize.heightBox;
    }
}
