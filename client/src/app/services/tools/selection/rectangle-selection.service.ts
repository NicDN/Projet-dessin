import { Injectable } from '@angular/core';
import { SelectionTool } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';

@Injectable({
    providedIn: 'root',
})
export class RectangleSelectionService extends SelectionTool {
    constructor(drawingService: DrawingService, rectangleDrawingService: RectangleDrawingService) {
        super(drawingService, rectangleDrawingService, 'Sélection par rectangle');
    }

    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const trueEndCoords = this.rectangleDrawingService.getTrueEndCoords(begin, end);
        this.rectangleDrawingService.drawPerimeter(ctx, begin, trueEndCoords);
    }

    fillWithWhite(ctx: CanvasRenderingContext2D, topLeft: Vec2, bottomRight: Vec2): void {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.rect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
        ctx.fill();
    }

    drawSelection(ctx: CanvasRenderingContext2D): void {
        ctx.putImageData(this.data, this.finalTopLeft.x, this.finalTopLeft.y);
    }
}
