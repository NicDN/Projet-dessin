import { Injectable } from '@angular/core';
import { SelectionTool } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';

@Injectable({
    providedIn: 'root',
})
export class EllipseSelectionService extends SelectionTool {
    constructor(drawingService: DrawingService, rectangleDrawingService: RectangleDrawingService) {
        super(drawingService, rectangleDrawingService, 'Sélection par ellipse');
    }

    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const trueEndCoords = this.rectangleDrawingService.getTrueEndCoords(begin, end);
        this.rectangleDrawingService.drawEllipticalPerimeter(ctx, begin, trueEndCoords);
    }

    fillWithWhite(ctx: CanvasRenderingContext2D, topLeft: Vec2, bottomRight: Vec2): void {
        const centerCoords: Vec2 = this.rectangleDrawingService.getCenterCoords(topLeft, bottomRight);

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(centerCoords.x, centerCoords.y, (bottomRight.x - topLeft.x) / 2, (bottomRight.y - topLeft.y) / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
    }

    drawSelection(ctx: CanvasRenderingContext2D): void {
        // commande.execute();
        ctx.save();
        const image: HTMLCanvasElement = document.createElement('canvas');
        image.width = this.finalBottomRight.x - this.finalTopLeft.x;
        image.height = this.finalBottomRight.y - this.finalTopLeft.y;
        (image.getContext('2d') as CanvasRenderingContext2D).putImageData(this.data, 0, 0);
        const centerCoords: Vec2 = this.rectangleDrawingService.getCenterCoords(this.finalTopLeft, this.finalBottomRight);

        ctx.beginPath();
        ctx.ellipse(
            centerCoords.x,
            centerCoords.y,
            (this.finalBottomRight.x - this.finalTopLeft.x) / 2,
            (this.finalBottomRight.y - this.finalTopLeft.y) / 2,
            0,
            0,
            2 * Math.PI,
        );
        ctx.clip();
        ctx.drawImage(image, this.finalTopLeft.x, this.finalTopLeft.y);
        ctx.restore();
    }
}
