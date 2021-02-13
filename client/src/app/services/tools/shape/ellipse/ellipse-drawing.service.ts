import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
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
        this.thickness = 1;
        this.minThickness = 1;
    }

    draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        this.setContextParameters(ctx, this.thickness);
        ctx.beginPath();

        const actualEndCoords: Vec2 = this.getActualEndCoords(begin, end);
        const center: Vec2 = this.getCenterCoords(begin, actualEndCoords);
        ctx.ellipse(center.x, center.y, this.getRadius(begin.x, actualEndCoords.x), this.getRadius(begin.y, actualEndCoords.y), 0, 0, 2 * Math.PI);

        if (this.traceType === TraceType.FilledNoBordered || this.traceType === TraceType.FilledAndBordered) {
            this.setFillColor(ctx, this.colorService.mainColor);
            ctx.fill();
        }
        if (this.traceType === TraceType.Bordered || this.traceType === TraceType.FilledAndBordered) {
            this.setStrokeColor(ctx, this.colorService.secondaryColor);
            ctx.stroke();
        }
    }

    setFillColor(ctx: CanvasRenderingContext2D, color: Color): void {
        ctx.fillStyle = color.rgbValue;
        ctx.globalAlpha = color.opacity;
    }

    setStrokeColor(ctx: CanvasRenderingContext2D, color: Color): void {
        ctx.strokeStyle = color.rgbValue;
        ctx.globalAlpha = color.opacity;
    }

    setContextParameters(ctx: CanvasRenderingContext2D, thickness: number): void {
        ctx.setLineDash([]);
        ctx.lineWidth = this.thickness;
        ctx.lineCap = 'round';
    }

    getActualEndCoords(begin: Vec2, end: Vec2): Vec2 {
        let endCoordX: number = end.x;
        let endCoordY: number = end.y;
        if (this.alternateShape) {
            endCoordX = begin.x + Math.sign(end.x - begin.x) * Math.min(Math.abs(end.x - begin.x), Math.abs(end.y - begin.y));
            endCoordY = begin.y + Math.sign(end.y - begin.y) * Math.min(Math.abs(end.x - begin.x), Math.abs(end.y - begin.y));
        }
        return { x: endCoordX, y: endCoordY };
    }

    getCenterCoords(begin: Vec2, end: Vec2): Vec2 {
        return { x: (end.x + begin.x) / 2, y: (end.y + begin.y) / 2 };
    }

    getRadius(begin: number, end: number): number {
        return Math.abs(end - begin) / 2 - this.thickness / 2;
    }
}
