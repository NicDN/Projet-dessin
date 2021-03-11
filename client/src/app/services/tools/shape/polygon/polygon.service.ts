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

    setContextParameters(ctx: CanvasRenderingContext2D, thickness: number): void {
        ctx.setLineDash([]);
        ctx.lineWidth = thickness;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
    }

    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        this.alternateShape = true;
        this.drawEllipticalPerimeter(ctx, begin, end);
    }
}
