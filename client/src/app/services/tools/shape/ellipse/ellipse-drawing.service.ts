import { Injectable } from '@angular/core';
import { ShapeCommand, ShapePropreties, ShapeType } from '@app/classes/commands/shape-command/shape-command';
import { Shape, TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class EllipseDrawingService extends Shape {
    subscription: Subscription;
    constructor(drawingService: DrawingService, colorService: ColorService, private undoRedoService: UndoRedoService) {
        super(drawingService, colorService, 'Ellipse');
    }

    draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const ellipseCommand: ShapeCommand = new ShapeCommand(this.loadUpPropreties(ctx, begin, end), this);
        ellipseCommand.execute();
    }

    executeShapeCommand(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const ellipseCommand: ShapeCommand = new ShapeCommand(this.loadUpPropreties(ctx, begin, end), this);
        ellipseCommand.execute();
        this.undoRedoService.addCommand(ellipseCommand);
    }

    drawShape(ellipsePropreties: ShapePropreties): void {
        const actualEndCoords: Vec2 = this.getTrueEndCoords(
            ellipsePropreties.beginCoords,
            ellipsePropreties.endCoords,
            ellipsePropreties.isAlternateShape,
        );
        const center: Vec2 = this.getCenterCoords(ellipsePropreties.beginCoords, actualEndCoords);
        const radiuses: Vec2 = {
            x: this.getRadius(ellipsePropreties.beginCoords.x, actualEndCoords.x),
            y: this.getRadius(ellipsePropreties.beginCoords.y, actualEndCoords.y),
        };

        ellipsePropreties.drawingContext.save();
        this.setContextParameters(ellipsePropreties.drawingContext, ellipsePropreties.drawingThickness);
        ellipsePropreties.drawingContext.beginPath();

        this.adjustToBorder(ellipsePropreties.drawingContext, radiuses, ellipsePropreties.beginCoords, actualEndCoords, ellipsePropreties.traceType);

        ellipsePropreties.drawingContext.ellipse(center.x, center.y, radiuses.x, radiuses.y, 0, 0, 2 * Math.PI);

        if (ellipsePropreties.traceType !== TraceType.Bordered) {
            this.setFillColor(ellipsePropreties.drawingContext, ellipsePropreties.mainColor);
            ellipsePropreties.drawingContext.fill();
        }
        if (ellipsePropreties.traceType !== TraceType.FilledNoBordered) {
            this.setStrokeColor(ellipsePropreties.drawingContext, ellipsePropreties.secondaryColor);
            ellipsePropreties.drawingContext.stroke();
        }
        ellipsePropreties.drawingContext.restore();
    }

    loadUpPropreties(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): ShapePropreties {
        return {
            shapeType: ShapeType.Ellipse,
            drawingContext: ctx,
            beginCoords: begin,
            endCoords: end,
            drawingThickness: this.thickness,
            mainColor: { rgbValue: this.colorService.mainColor.rgbValue, opacity: this.colorService.mainColor.opacity },
            secondaryColor: { rgbValue: this.colorService.secondaryColor.rgbValue, opacity: this.colorService.secondaryColor.opacity },
            isAlternateShape: this.alternateShape,
            traceType: this.traceType,
        };
    }

    setContextParameters(ctx: CanvasRenderingContext2D, thickness: number): void {
        ctx.setLineDash([]);
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
    }
}
