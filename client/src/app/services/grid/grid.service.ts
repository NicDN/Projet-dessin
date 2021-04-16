import { Injectable } from '@angular/core';
import { BoxSize } from '@app/classes/box-size';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class GridService extends Tool {
    readonly MIN_SQUARE_SIZE: number = 20;
    readonly MAX_SQUARE_SIZE: number = 100;

    readonly MIN_OPACITY_PERCENTAGE: number = 20;
    readonly MAX_OPACITY_PERCENTAGE: number = 100;

    private readonly PERCENTAGE_CONVERTER: number = 100;

    squareSize: number = 20;
    opacity: number = 20;

    gridDrawn: boolean = false;

    private readonly MULTIPLIER_FACTOR: number = 5;

    constructor(drawingService: DrawingService) {
        super(drawingService, 'Options de grille');
        this.listenToResizeNotifications();
        this.listenToUpdateGridNotification();
    }

    private listenToResizeNotifications(): void {
        this.drawingService.newIncomingResizeSignals().subscribe((boxSize) => {
            this.resizeGridNotification(boxSize);
        });
    }

    private listenToUpdateGridNotification(): void {
        this.drawingService.newGridSignals().subscribe(() => {
            if (this.gridDrawn) this.drawGrid();
        });
    }

    private resizeGridNotification(boxSize: BoxSize): void {
        if (this.drawingService.gridCanvas === undefined) return;
        this.drawingService.gridCanvas.height = boxSize.heightBox;
        this.drawingService.gridCanvas.width = boxSize.widthBox;
        if (this.gridDrawn) this.drawGrid();
    }

    handleDrawGrid(): void {
        this.gridDrawn = !this.gridDrawn;
        this.drawingService.clearCanvas(this.drawingService.gridCtx);
        if (!this.gridDrawn) return;
        this.drawGrid();
    }

    drawGrid(): void {
        this.drawingService.clearCanvas(this.drawingService.gridCtx);
        this.drawingService.gridCtx.beginPath();
        this.drawingService.gridCtx.save();
        this.setGridContext();
        for (let y = 0; y <= this.drawingService.gridCanvas.height; y += this.squareSize) {
            this.drawingService.gridCtx.moveTo(0, y);
            this.drawingService.gridCtx.lineTo(this.drawingService.gridCanvas.width, y);
        }

        for (let x = 0; x <= this.drawingService.gridCanvas.width; x += this.squareSize) {
            this.drawingService.gridCtx.moveTo(x, 0);
            this.drawingService.gridCtx.lineTo(x, this.drawingService.gridCanvas.height);
        }

        this.drawingService.gridCtx.stroke();
        this.drawingService.gridCtx.closePath();
        this.drawingService.gridCtx.restore();
    }

    private setGridContext(): void {
        this.drawingService.gridCtx.strokeStyle = 'black';
        this.drawingService.gridCtx.lineWidth = 1;
        this.drawingService.gridCtx.globalAlpha = this.opacity / this.PERCENTAGE_CONVERTER;
    }

    incrementSquareSize(): void {
        if (this.squareSize < this.MAX_SQUARE_SIZE)
            this.squareSize = (Math.floor(this.squareSize / this.MULTIPLIER_FACTOR) + 1) * this.MULTIPLIER_FACTOR;
    }

    decrementSquareSize(): void {
        if (this.squareSize > this.MIN_SQUARE_SIZE)
            this.squareSize = Math.floor((this.squareSize - 1) / this.MULTIPLIER_FACTOR) * this.MULTIPLIER_FACTOR;
    }
}
