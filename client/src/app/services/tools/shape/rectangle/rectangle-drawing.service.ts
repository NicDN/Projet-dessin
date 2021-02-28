import { Injectable } from '@angular/core';
import { RectangleCommand } from '@app/classes/commands/rectangle-command';
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
        const rectangleCommad: RectangleCommand = new RectangleCommand(
            ctx,
            begin,
            end,
            this.thickness,
            this.colorService.mainColor.rgbValue,
            this.colorService.secondaryColor.rgbValue,
            this.colorService.mainColor.opacity,
            this,
        );
        rectangleCommad.execute();
    }

    adjustToBorder(ctx: CanvasRenderingContext2D, sideLengths: Vec2, begin: Vec2, end: Vec2): void {
        if (this.traceType === TraceType.FilledNoBordered) {
            return;
        }
        if (Math.abs(sideLengths.x) <= ctx.lineWidth) {
            ctx.lineWidth = Math.abs(sideLengths.x) > 1 ? Math.abs(sideLengths.x) - 1 : 1;
        }
        if (Math.abs(sideLengths.y) <= ctx.lineWidth) {
            ctx.lineWidth = Math.abs(sideLengths.y) > 1 ? Math.abs(sideLengths.y) - 1 : 1;
        }
        begin.x += (Math.sign(end.x - begin.x) * ctx.lineWidth) / 2;
        begin.y += (Math.sign(end.y - begin.y) * ctx.lineWidth) / 2;
        sideLengths.x -= Math.sign(end.x - begin.x) * ctx.lineWidth;
        sideLengths.y -= Math.sign(end.y - begin.y) * ctx.lineWidth;
    }

    setContextParameters(ctx: CanvasRenderingContext2D, thickness: number): void {
        ctx.setLineDash([]);
        ctx.lineWidth = thickness;
        ctx.lineJoin = 'miter';
    }
}
