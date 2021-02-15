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
    }
    draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        this.setContextParameters(ctx, this.thickness);

        ctx.beginPath();
        const actualEndCoords: Vec2 = this.getActualEndCoords(begin, end);
        const lengths: Vec2 = { x: actualEndCoords.x - begin.x, y: actualEndCoords.y - begin.y };
        const adjustedBeginCoords: Vec2 = { x: begin.x, y: begin.y };

        this.adjustToWidth(ctx, lengths, adjustedBeginCoords, actualEndCoords);
        ctx.rect(adjustedBeginCoords.x, adjustedBeginCoords.y, lengths.x, lengths.y);

        if (this.traceType !== TraceType.Bordered) {
            this.setFillColor(ctx, this.colorService.mainColor);
            ctx.fill();
        }
        if (this.traceType !== TraceType.FilledNoBordered) {
            this.setStrokeColor(ctx, this.colorService.secondaryColor);
            ctx.stroke();
        }
    }

    adjustToWidth(ctx: CanvasRenderingContext2D, lengths: Vec2, begin: Vec2, end: Vec2): void {
        if (this.traceType === TraceType.FilledNoBordered) {
            return;
        }
        if (Math.abs(lengths.x) <= ctx.lineWidth) {
            ctx.lineWidth = Math.abs(lengths.x) > 1 ? Math.abs(lengths.x) - 1 : 1;
        }
        if (Math.abs(lengths.y) <= ctx.lineWidth) {
            ctx.lineWidth = Math.abs(lengths.y) > 1 ? Math.abs(lengths.y) - 1 : 1;
        }
        begin.x += (Math.sign(end.x - begin.x) * ctx.lineWidth) / 2;
        begin.y += (Math.sign(end.y - begin.y) * ctx.lineWidth) / 2;
        lengths.x -= Math.sign(end.x - begin.x) * ctx.lineWidth;
        lengths.y -= Math.sign(end.y - begin.y) * ctx.lineWidth;
    }

    setContextParameters(ctx: CanvasRenderingContext2D, thickness: number): void {
        ctx.setLineDash([]);
        ctx.lineWidth = thickness;
        ctx.lineJoin = 'miter';
    }
}
