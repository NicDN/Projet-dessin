import { Injectable } from '@angular/core';
import { Shape, TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class PolygonService extends Shape {
    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService, 'Polygone');
    }

    draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        ctx.save();
        this.drawPolygon(ctx, begin, end);

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

    drawPolygon(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        this.alternateShape = true;

        const actualEndCoords: Vec2 = this.getTrueEndCoords(begin, end);
        const center: Vec2 = this.getCenterCoords(begin, actualEndCoords);
        const radiuses: Vec2 = { x: this.getRadius(begin.x, actualEndCoords.x), y: this.getRadius(begin.y, actualEndCoords.y) };
        const angle: number = (2 * Math.PI) / this.numberOfSides;

        this.setContextParameters(ctx, this.thickness);
        ctx.beginPath();
        this.adjustToBorder(ctx, radiuses, begin, actualEndCoords);
        for (let i = 0; i <= this.numberOfSides; i++) {
            ctx.lineTo(center.x - radiuses.x * Math.sin(i * angle), center.y - radiuses.y * Math.cos(i * angle));
        }
    }

    getCenterCoords(begin: Vec2, end: Vec2): Vec2 {
        return { x: (end.x + begin.x) / 2, y: (end.y + begin.y) / 2 };
    }

    getRadius(begin: number, end: number): number {
        return Math.abs(end - begin) / 2;
    }

    setContextParameters(ctx: CanvasRenderingContext2D, thickness: number): void {
        ctx.setLineDash([]);
        ctx.lineWidth = thickness;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
    }

    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const actualEndCoords: Vec2 = this.getTrueEndCoords(begin, end);
        const center: Vec2 = this.getCenterCoords(begin, actualEndCoords);
        const radiuses: Vec2 = { x: this.getRadius(begin.x, actualEndCoords.x), y: this.getRadius(begin.y, actualEndCoords.y) };
        ctx.save();
        ctx.beginPath();

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.setLineDash([this.dashSize * 2, this.dashSize]);

        ctx.arc(center.x, center.y, radiuses.x, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }

    adjustToBorder(ctx: CanvasRenderingContext2D, radiuses: Vec2, begin: Vec2, end: Vec2): void {
        const thicknessAdjustment: number = this.traceType !== TraceType.FilledNoBordered ? ctx.lineWidth / 2 : 0;
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
