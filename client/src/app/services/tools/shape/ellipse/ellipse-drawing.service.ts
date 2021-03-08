import { Injectable } from '@angular/core';
import { Shape, TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class EllipseDrawingService extends Shape {
    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService, 'Ellipse');
    }

    draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const actualEndCoords: Vec2 = this.getTrueEndCoords(begin, end);
        const center: Vec2 = this.getCenterCoords(begin, actualEndCoords);
        const radiuses: Vec2 = { x: this.getRadius(begin.x, actualEndCoords.x), y: this.getRadius(begin.y, actualEndCoords.y) };

        ctx.save();
        this.setContextParameters(ctx, this.thickness);
        ctx.beginPath();

        this.adjustToBorder(ctx, radiuses, begin, actualEndCoords);

        ctx.ellipse(center.x, center.y, radiuses.x, radiuses.y, 0, 0, 2 * Math.PI);

        if (this.traceType !== TraceType.Bordered) {
            this.setFillColor(ctx, this.colorService.mainColor);
            ctx.fill();
        }
        if (this.traceType !== TraceType.FilledNoBordered) {
            this.setStrokeColor(ctx, this.colorService.secondaryColor);
            ctx.stroke();
        }
        ctx.restore();
    }

    setContextParameters(ctx: CanvasRenderingContext2D, thickness: number): void {
        ctx.setLineDash([]);
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
    }
}
