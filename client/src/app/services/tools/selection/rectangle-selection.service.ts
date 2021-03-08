import { Injectable } from '@angular/core';
import { SelectionTool } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleDrawingService } from '../shape/rectangle/rectangle-drawing.service';

@Injectable({
    providedIn: 'root',
})
export class RectangleSelectionService extends SelectionTool {
    private data: ImageData;
    private offset: Vec2;

    constructor(drawingService: DrawingService, rectangleDrawingService: RectangleDrawingService) {
        super(drawingService, rectangleDrawingService, 'Rectangle Selection');
    }

    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const trueEndCoords = this.rectangleDrawingService.getTrueEndCoords(begin, end);
        this.rectangleDrawingService.drawPerimeter(ctx, begin, trueEndCoords);
    }

    drawBox(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const trueEndCoords = this.rectangleDrawingService.getTrueEndCoords(begin, end);
        ctx.save();
        ctx.lineWidth = 0;
        ctx.lineJoin = 'miter';
        ctx.strokeStyle = this.boxColor.rgbValue;
        ctx.globalAlpha = this.boxColor.opacity;
        ctx.beginPath();
        ctx.rect(begin.x, begin.y, trueEndCoords.x - begin.x, trueEndCoords.y - begin.y);
        ctx.stroke();
        ctx.restore();
        this.drawControlPoints(ctx, begin, trueEndCoords);
    }

    drawControlPoints(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const pointWidth = 6;
        const halfPointWidth = pointWidth / 2;
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'blue';
        ctx.rect(begin.x - halfPointWidth, begin.y - halfPointWidth, pointWidth, pointWidth);
        ctx.rect(begin.x - halfPointWidth, end.y - halfPointWidth, pointWidth, pointWidth);
        ctx.rect(end.x - halfPointWidth, begin.y - halfPointWidth, pointWidth, pointWidth);
        ctx.rect(end.x - halfPointWidth, end.y - halfPointWidth, pointWidth, pointWidth);
        ctx.rect((end.x + begin.x) / 2 - halfPointWidth, begin.y - halfPointWidth, pointWidth, pointWidth);
        ctx.rect((end.x + begin.x) / 2 - halfPointWidth, end.y - halfPointWidth, pointWidth, pointWidth);
        ctx.rect(begin.x - halfPointWidth, (begin.y + end.y) / 2 - halfPointWidth, pointWidth, pointWidth);
        ctx.rect(end.x - halfPointWidth, (begin.y + end.y) / 2 - halfPointWidth, pointWidth, pointWidth);
        ctx.stroke();
        ctx.fill();
    }

    isInsideSelection(point: Vec2): boolean {
        return (
            point.x > this.finalTopLeft.x && point.x < this.finalBottomRight.x && point.y > this.finalTopLeft.y && point.y < this.finalBottomRight.y
        );
    }

    moveSelection(ctx: CanvasRenderingContext2D, pos: Vec2): void {
        this.finalTopLeft = { x: pos.x - this.offset.x, y: pos.y - this.offset.y };
        this.finalBottomRight = {
            x: this.finalTopLeft.x + Math.abs(this.initialBottomRight.x - this.initialTopLeft.x),
            y: this.finalTopLeft.y + Math.abs(this.initialBottomRight.y - this.initialTopLeft.y),
        };

        this.drawSelection(ctx);
        this.drawPerimeter(ctx, this.finalTopLeft, this.finalBottomRight);
        this.drawBox(ctx, this.finalTopLeft, this.finalBottomRight);
    }

    saveSelection(ctx: CanvasRenderingContext2D): void {
        this.finalTopLeft = {
            x: Math.min(this.initialTopLeft.x, this.initialBottomRight.x),
            y: Math.min(this.initialTopLeft.y, this.initialBottomRight.y),
        };
        this.finalBottomRight = {
            x: Math.max(this.initialTopLeft.x, this.initialBottomRight.x),
            y: Math.max(this.initialTopLeft.y, this.initialBottomRight.y),
        };
        this.initialTopLeft = this.finalTopLeft;
        this.initialBottomRight = this.finalBottomRight;

        this.data = ctx.getImageData(
            this.initialTopLeft.x,
            this.initialTopLeft.y,
            this.initialBottomRight.x - this.initialTopLeft.x,
            this.initialBottomRight.y - this.initialTopLeft.y,
        );

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.rect(
            this.initialTopLeft.x,
            this.initialTopLeft.y,
            this.initialBottomRight.x - this.initialTopLeft.x,
            this.initialBottomRight.y - this.initialTopLeft.y,
        );
        ctx.fill();
    }

    setOffSet(pos: Vec2): void {
        this.offset = { x: pos.x - this.finalTopLeft.x, y: pos.y - this.finalTopLeft.y };
    }

    drawSelection(ctx: CanvasRenderingContext2D): void {
        ctx.putImageData(this.data, this.finalTopLeft.x, this.finalTopLeft.y);
    }

    cancelSelection(): void {
        if (this.hasSelection) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.finalTopLeft.x = this.initialTopLeft.x;
            this.finalTopLeft.y = this.initialTopLeft.y;
            this.drawSelection(this.drawingService.baseCtx);
            this.hasSelection = false;
            this.movingSelection = false;
            this.finalTopLeft.x = 0;
            this.finalTopLeft.y = 0;
            this.finalBottomRight.x = 0;
            this.finalBottomRight.y = 0;
            // this.data = 0;
        }
    }
}
