import { Injectable } from '@angular/core';
import { ShapeCommand, ShapePropreties } from '@app/classes/commands/shape-command/shape-command';
import { Shape } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class PolygonService extends Shape {
    readonly MAX_SIDES: number = 12;
    readonly MIN_SIDES: number = 3;

    numberOfSides: number = 3;

    constructor(drawingService: DrawingService, colorService: ColorService, private undoRedoService: UndoRedoService) {
        super(drawingService, colorService, 'Polygone');
    }

    private loadUpPropreties(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): ShapePropreties {
        return {
            drawingContext: ctx,
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
        const polygonCommand: ShapeCommand = new ShapeCommand(this.loadUpPropreties(ctx, begin, end), this);
        polygonCommand.execute();

        if (ctx === this.drawingService.baseCtx) {
            this.undoRedoService.addCommand(polygonCommand);
        }
    }

    drawShape(polygonPropreties: ShapePropreties): void {
        if (polygonPropreties.numberOfSides === undefined) return;

        polygonPropreties.drawingContext.save();
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

        this.setContextParameters(polygonPropreties.drawingContext, polygonPropreties.drawingThickness);
        polygonPropreties.drawingContext.beginPath();
        this.adjustToBorder(polygonPropreties.drawingContext, radiuses, polygonPropreties.beginCoords, actualEndCoords, polygonPropreties.traceType);

        for (let i = 0; i <= polygonPropreties.numberOfSides; i++) {
            polygonPropreties.drawingContext.lineTo(center.x - radiuses.x * Math.sin(i * angle), center.y - radiuses.y * Math.cos(i * angle));
        }

        this.drawTraceType(polygonPropreties);
    }

    private setContextParameters(ctx: CanvasRenderingContext2D, thickness: number): void {
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
