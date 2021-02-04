import { Injectable } from '@angular/core';
import { DrawingType, Shape } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class EllipseDrawingService extends Shape {
    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService);
        this.drawingType = DrawingType.FilledAndBordered;
        this.thickness = 2;
    }

    draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        ctx.setLineDash([]);
        ctx.lineWidth = this.thickness;
        ctx.beginPath();
        let endCoordX: number = end.x;
        let endCoordY: number = end.y;
        if (this.alternateShape) {
            endCoordX = begin.x + Math.sign(end.x - begin.x) * Math.min(Math.abs(end.x - begin.x), Math.abs(end.y - begin.y));
            endCoordY = begin.y + Math.sign(end.y - begin.y) * Math.min(Math.abs(end.x - begin.x), Math.abs(end.y - begin.y));
        }
        ctx.ellipse(
            (endCoordX + begin.x) / 2,
            (endCoordY + begin.y) / 2,
            Math.abs(endCoordX - begin.x) / 2,
            Math.abs(endCoordY - begin.y) / 2,
            0,
            0,
            2 * Math.PI,
        );
        ctx.fillStyle = this.colorService.mainColor.rgbValue;
        ctx.strokeStyle = this.colorService.secondaryColor.rgbValue;

        if (this.drawingType === DrawingType.FilledNoBordered || this.drawingType === DrawingType.FilledAndBordered) ctx.fill();
        if (this.drawingType === DrawingType.Bordered || this.drawingType === DrawingType.FilledAndBordered) ctx.stroke();
    }
}
