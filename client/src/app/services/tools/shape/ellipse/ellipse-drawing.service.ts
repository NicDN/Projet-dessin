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
        this.traceType = TraceType.FilledAndBordered;
        this.thickness = 1;
        this.minThickness = 1;
    }

    draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        this.setContextParameters(ctx, this.thickness);
        ctx.beginPath();

        const actualEndCoords: Vec2 = this.getActualEndCoords(begin, end);
        const center: Vec2 = this.getCenterCoords(begin, actualEndCoords);
        const radiuses: Vec2 = { x: this.getRadius(begin.x, actualEndCoords.x), y: this.getRadius(begin.y, actualEndCoords.y) };
        this.adjustToWidth(ctx, radiuses, begin, actualEndCoords);

        ctx.ellipse(center.x, center.y, radiuses.x, radiuses.y, 0, 0, 2 * Math.PI);

        if (this.traceType !== TraceType.Bordered) {
            this.setFillColor(ctx, this.colorService.mainColor);
            ctx.fill();
        }
        if (this.traceType !== TraceType.FilledNoBordered) {
            this.setStrokeColor(ctx, this.colorService.secondaryColor);
            ctx.stroke();
        }
    }

    setContextParameters(ctx: CanvasRenderingContext2D, thickness: number): void {
        ctx.setLineDash([]);
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
    }

    getCenterCoords(begin: Vec2, end: Vec2): Vec2 {
        return { x: (end.x + begin.x) / 2, y: (end.y + begin.y) / 2 };
    }

    getRadius(begin: number, end: number): number {
        return Math.abs(end - begin) / 2;
    }

    adjustToWidth(ctx: CanvasRenderingContext2D, radiuses: Vec2, begin: Vec2, end: Vec2): void {
        const thicknessAdjustment: number =
            this.traceType === TraceType.Bordered || this.traceType === TraceType.FilledAndBordered ? ctx.lineWidth / 2 : 0;
        radiuses.x -= thicknessAdjustment;
        radiuses.y -= thicknessAdjustment;
        if (radiuses.x <= 0) {
            ctx.lineWidth = begin.x !== end.x ? Math.abs(begin.x - end.x) : 1;
            radiuses.x = 1;
            radiuses.y = this.getRadius(begin.y, end.y) - ctx.lineWidth / 2;
        }
        if (radiuses.y <= 0) {
            ctx.lineWidth = begin.y !== end.y ? Math.abs(begin.y - end.y) : 1;
            radiuses.y = 1;
            radiuses.x = begin.x !== end.x ? this.getRadius(begin.x, end.x) - ctx.lineWidth / 2 : 1;
        }
    }
}
