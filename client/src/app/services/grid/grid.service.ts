import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class GridService extends Tool {
    readonly MIN_SQUARE_SIZE: number = 1;
    readonly MAX_SQUARE_SIZE: number = 20;

    readonly MIN_OPACITY_PERCENTAGE: number = 1;
    readonly MAX_OPACITY_PERCENTAGE: number = 100;

    squareSize: number = 1;
    opacity: number = 1;

    gridDrawn: boolean = false;

    MULTIPLIER_FACTOR: number = 5;
    canvas: HTMLCanvasElement;
    gridCtx: CanvasRenderingContext2D;

    constructor(drawingService: DrawingService) {
        super(drawingService, 'Grille');
    }

    drawGrid(): void {
        this.gridCtx.save();
        this.setGridContext();

        for (let x = 0; x < this.canvas.width; x += this.squareSize) {
            this.gridCtx.moveTo(x, 0);
            this.gridCtx.lineTo(x, this.canvas.width);
        }

        for (let y = 0; y < this.canvas.height; y += this.squareSize) {
            this.gridCtx.moveTo(0, y);
            this.gridCtx.lineTo(this.canvas.height, y);
        }

        this.gridCtx.stroke();
        this.gridCtx.restore();
    }

    private setGridContext(): void {
        this.gridCtx.strokeStyle = 'black';
        this.gridCtx.lineWidth = 1;
        this.gridCtx.globalAlpha = this.opacity / 100;
    }

    incrementSquareSize(): void {
        this.squareSize = (Math.floor(this.squareSize / this.MULTIPLIER_FACTOR) + 1) * this.MULTIPLIER_FACTOR;
    }

    decrementSquareSize(): void {
        this.squareSize = Math.floor((this.squareSize - 1) / this.MULTIPLIER_FACTOR) * this.MULTIPLIER_FACTOR;
    }
}
