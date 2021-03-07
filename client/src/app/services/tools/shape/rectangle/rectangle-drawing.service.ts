import { Injectable } from '@angular/core';
import { RectangleCommand, RectanglePropreties } from '@app/classes/commands/rectangle-command/rectangle-command';
import { Shape, TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
@Injectable({
    providedIn: 'root',
})
export class RectangleDrawingService extends Shape {
    constructor(drawingService: DrawingService, colorService: ColorService, public undoRedoService: UndoRedoService) {
        super(drawingService, colorService, 'Rectangle');
    }

    draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const rectangleCommad: RectangleCommand = new RectangleCommand(this, this.loadUpPropreties(ctx, begin, end));
        rectangleCommad.execute();
    }

    drawRectangle(rectanglePropreties: RectanglePropreties): void {
        const trueEndCoords: Vec2 = this.getTrueEndCoords(
            rectanglePropreties.beginCoords,
            rectanglePropreties.endCoords,
            rectanglePropreties.isAlternateShape,
        );
        const sideLengths: Vec2 = {
            x: trueEndCoords.x - rectanglePropreties.beginCoords.x,
            y: trueEndCoords.y - rectanglePropreties.beginCoords.y,
        };
        const adjustedBeginCoords: Vec2 = { x: rectanglePropreties.beginCoords.x, y: rectanglePropreties.beginCoords.y };

        rectanglePropreties.drawingCtx.save();
        this.setContextParameters(rectanglePropreties.drawingCtx, rectanglePropreties.drawingThickness);
        rectanglePropreties.drawingCtx.beginPath();

        this.adjustToBorder(rectanglePropreties.drawingCtx, sideLengths, adjustedBeginCoords, trueEndCoords, rectanglePropreties.traceType);
        rectanglePropreties.drawingCtx.rect(adjustedBeginCoords.x, adjustedBeginCoords.y, sideLengths.x, sideLengths.y);

        if (rectanglePropreties.traceType !== TraceType.Bordered) {
            this.setFillColor(rectanglePropreties.drawingCtx, rectanglePropreties.mainColor);
            rectanglePropreties.drawingCtx.fill();
        }
        if (rectanglePropreties.traceType !== TraceType.FilledNoBordered) {
            this.setStrokeColor(rectanglePropreties.drawingCtx, rectanglePropreties.secondaryColor);
            rectanglePropreties.drawingCtx.stroke();
        }
        rectanglePropreties.drawingCtx.restore();
    }

    executeShapeCommand(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const rectangleCommad: RectangleCommand = new RectangleCommand(this, this.loadUpPropreties(ctx, begin, end));
        rectangleCommad.execute();
        this.undoRedoService.addCommand(rectangleCommad);
    }

    loadUpPropreties(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): RectanglePropreties {
        return {
            drawingCtx: ctx,
            beginCoords: begin,
            endCoords: end,
            drawingThickness: this.thickness,
            mainColor: { rgbValue: this.colorService.mainColor.rgbValue, opacity: this.colorService.mainColor.opacity },
            secondaryColor: { rgbValue: this.colorService.secondaryColor.rgbValue, opacity: this.colorService.secondaryColor.opacity },
            isAlternateShape: this.alternateShape,
            traceType: this.traceType,
        };
    }

    adjustToBorder(ctx: CanvasRenderingContext2D, sideLengths: Vec2, begin: Vec2, end: Vec2, traceType: TraceType): void {
        if (traceType === TraceType.FilledNoBordered) {
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
