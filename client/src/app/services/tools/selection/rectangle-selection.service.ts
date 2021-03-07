import { Injectable } from '@angular/core';
import { SelectionTool } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';

@Injectable({
    providedIn: 'root',
})
export class RectangleSelectionService extends SelectionTool {
    private data: ImageData;
    private offset: Vec2;

    constructor(drawingService: DrawingService, private rectangleDrawingService: RectangleDrawingService) {
        super(drawingService, 'Rectangle Selection');
    }

    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        this.rectangleDrawingService.drawPerimeter(ctx, begin, end);
    }

    drawBox(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        ctx.save();
        ctx.lineWidth = 0;
        ctx.lineJoin = 'miter';
        ctx.strokeStyle = this.boxColor.rgbValue;
        ctx.globalAlpha = this.boxColor.opacity;
        ctx.beginPath();
        ctx.rect(begin.x, begin.y, end.x - begin.x, end.y - begin.y);
        ctx.stroke();
        ctx.restore();
    }

    isInsideSelection(point: Vec2): boolean {
        return (
            Math.abs(point.x - this.finalTopLeft.x) < Math.abs(this.finalTopLeft.x - this.finalBottomRight.x) &&
            Math.abs(point.x - this.finalBottomRight.x) < Math.abs(this.finalTopLeft.x - this.finalBottomRight.x) &&
            Math.abs(point.y - this.finalTopLeft.y) < Math.abs(this.finalTopLeft.y - this.finalBottomRight.y) &&
            Math.abs(point.y - this.finalBottomRight.y) < Math.abs(this.finalTopLeft.y - this.finalBottomRight.y)
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
}
