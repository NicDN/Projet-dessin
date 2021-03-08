import { Injectable } from '@angular/core';
import { PolygonCommand, PolygonPropreties } from '@app/classes/commands/polygon-command/polygon-command';
import { Shape, TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class PolygonService extends Shape {
    constructor(drawingService: DrawingService, colorService: ColorService, public undoRedoService: UndoRedoService) {
        super(drawingService, colorService, 'Polygone');
    }
    executeShapeCommand(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const polygonCommand = new PolygonCommand(this, this.loadUpPropreties(ctx, begin, end));
        polygonCommand.execute();
        this.undoRedoService.addCommand(polygonCommand);
    }

    loadUpPropreties(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): PolygonPropreties {
        return {
            drawingCtx: ctx,
            beginCoords: begin,
            endCoords: end,
            drawingThickness: this.thickness,
            mainColor: { rgbValue: this.colorService.mainColor.rgbValue, opacity: this.colorService.mainColor.opacity },
            secondaryColor: { rgbValue: this.colorService.secondaryColor.rgbValue, opacity: this.colorService.secondaryColor.opacity },
            isAlternateShape: this.alternateShape,
            traceType: this.traceType,
            numberOfSides: this.numberOfSides,
        };
    }

    draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const polygonCommand: PolygonCommand = new PolygonCommand(this, this.loadUpPropreties(ctx, begin, end));
        polygonCommand.execute();
    }

    drawPolygon(polygonPropreties: PolygonPropreties): void {
        polygonPropreties.drawingCtx.save();
        polygonPropreties.isAlternateShape = true;

        const actualEndCoords: Vec2 = this.getTrueEndCoords(
            polygonPropreties.beginCoords,
            polygonPropreties.endCoords,
            polygonPropreties.isAlternateShape,
        );
        const center: Vec2 = this.getCenterCoords(polygonPropreties.beginCoords, actualEndCoords);
        const radiuses: Vec2 = {
            x: this.getRadius(polygonPropreties.beginCoords.x, actualEndCoords.x),
            y: this.getRadius(polygonPropreties.beginCoords.y, actualEndCoords.y),
        };
        const angle: number = (2 * Math.PI) / polygonPropreties.numberOfSides;

        this.setContextParameters(polygonPropreties.drawingCtx, polygonPropreties.drawingThickness);
        polygonPropreties.drawingCtx.beginPath();
        this.adjustToBorder(polygonPropreties.drawingCtx, radiuses, polygonPropreties.beginCoords, actualEndCoords, polygonPropreties.traceType);
        for (let i = 0; i <= polygonPropreties.numberOfSides; i++) {
            polygonPropreties.drawingCtx.lineTo(center.x - radiuses.x * Math.sin(i * angle), center.y - radiuses.y * Math.cos(i * angle));
        }

        if (polygonPropreties.traceType !== TraceType.Bordered) {
            this.setFillColor(polygonPropreties.drawingCtx, polygonPropreties.mainColor);
            polygonPropreties.drawingCtx.fill();
        }

        if (polygonPropreties.traceType !== TraceType.FilledNoBordered) {
            this.setStrokeColor(polygonPropreties.drawingCtx, polygonPropreties.secondaryColor);
            polygonPropreties.drawingCtx.stroke();
        }
        polygonPropreties.drawingCtx.restore();
    }

    setContextParameters(ctx: CanvasRenderingContext2D, thickness: number): void {
        ctx.setLineDash([]);
        ctx.lineWidth = thickness;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
    }

    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const actualEndCoords: Vec2 = this.getTrueEndCoords(begin, end, true);
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
}
