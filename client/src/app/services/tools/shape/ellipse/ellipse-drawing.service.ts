import { Injectable } from '@angular/core';
import { EllipseCommand, EllipsePropreties } from '@app/classes/commands/ellipse-command/ellipse-command';
import { Shape, TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class EllipseDrawingService extends Shape {
    constructor(drawingService: DrawingService, colorService: ColorService, private undoRedoService: UndoRedoService) {
        super(drawingService, colorService, 'Ellipse');
    }

    draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const ellipseCommand: EllipseCommand = new EllipseCommand(this, this.loadUpPropreties(ctx, begin, end));
        ellipseCommand.execute();
    }

    executeShapeCommand(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const ellipseCommand: EllipseCommand = new EllipseCommand(this, this.loadUpPropreties(ctx, begin, end));
        ellipseCommand.execute();
        this.undoRedoService.addCommand(ellipseCommand);
    }

    drawEllipse(ellipsePropreties: EllipsePropreties): void {
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

    loadUpPropreties(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): EllipsePropreties {
        return {
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

    getCenterCoords(begin: Vec2, end: Vec2): Vec2 {
        return { x: (end.x + begin.x) / 2, y: (end.y + begin.y) / 2 };
    }

    getRadius(begin: number, end: number): number {
        return Math.abs(end - begin) / 2;
    }

    adjustToBorder(ctx: CanvasRenderingContext2D, radiuses: Vec2, begin: Vec2, end: Vec2, traceType: TraceType): void {
        const thicknessAdjustment: number = traceType !== TraceType.FilledNoBordered ? ctx.lineWidth / 2 : 0;
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
