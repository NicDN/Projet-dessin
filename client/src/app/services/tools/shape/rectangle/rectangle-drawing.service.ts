import { Injectable } from '@angular/core';
import { Shape, TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
@Injectable({
    providedIn: 'root',
})
export class RectangleDrawingService extends Shape {
    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService, 'Rectangle');
        this.traceType = TraceType.FilledAndBordered;
        this.thickness = 1;
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
        ctx.rect(begin.x, begin.y, endCoordX - begin.x, endCoordY - begin.y);

        ctx.fillStyle = this.colorService.mainColor.rgbValue;
        ctx.globalAlpha = this.colorService.mainColor.opacity;
        if (this.traceType === TraceType.FilledNoBordered || this.traceType === TraceType.FilledAndBordered) ctx.fill();
        ctx.strokeStyle = this.colorService.secondaryColor.rgbValue;
        ctx.globalAlpha = this.colorService.secondaryColor.opacity;
        if (this.traceType === TraceType.Bordered || this.traceType === TraceType.FilledAndBordered) ctx.stroke();
    }
}
