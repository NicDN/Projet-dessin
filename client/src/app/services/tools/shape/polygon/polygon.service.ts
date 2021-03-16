import { Injectable } from '@angular/core';
import { ShapeCommand, ShapePropreties, ShapeType } from '@app/classes/commands/shape-command/shape-command';
import { Shape, TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShapeService } from '@app/services/tools/shape/shape.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PolygonService extends Shape {
    subscription: Subscription;
    constructor(
        drawingService: DrawingService,
        colorService: ColorService,
        public undoRedoService: UndoRedoService,
        private shapeService: ShapeService,
    ) {
        super(drawingService, colorService, 'Polygone');
        this.listenToNewPolygonDrawingCommands();
    }

    listenToNewPolygonDrawingCommands(): void {
        this.subscription = this.shapeService.newPolygonDrawing().subscribe((shapePropreties) => {
            this.drawPolygon(shapePropreties);
        });
    }

    executeShapeCommand(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const polygonCommand = new ShapeCommand(this.loadUpPropreties(ctx, begin, end), this.shapeService);
        polygonCommand.execute();
        this.undoRedoService.addCommand(polygonCommand);
    }

    loadUpPropreties(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): ShapePropreties {
        return {
            shapeType: ShapeType.Polygon,
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
        const polygonCommand: ShapeCommand = new ShapeCommand(this.loadUpPropreties(ctx, begin, end), this.shapeService);
        polygonCommand.execute();
    }

    drawPolygon(shapePropreties: ShapePropreties): void {
        if (shapePropreties.numberOfSides === undefined) return;

        shapePropreties.drawingContext.save();
        shapePropreties.isAlternateShape = true;

        const actualEndCoords: Vec2 = this.getTrueEndCoords(shapePropreties.beginCoords, shapePropreties.endCoords, shapePropreties.isAlternateShape);
        const center: Vec2 = this.getCenterCoords(shapePropreties.beginCoords, actualEndCoords);
        const radiuses: Vec2 = {
            x: this.getRadius(shapePropreties.beginCoords.x, actualEndCoords.x),
            y: this.getRadius(shapePropreties.beginCoords.y, actualEndCoords.y),
        };

        const angle: number = (2 * Math.PI) / shapePropreties.numberOfSides;

        this.setContextParameters(shapePropreties.drawingContext, shapePropreties.drawingThickness);
        shapePropreties.drawingContext.beginPath();
        this.adjustToBorder(shapePropreties.drawingContext, radiuses, shapePropreties.beginCoords, actualEndCoords, shapePropreties.traceType);
        for (let i = 0; i <= shapePropreties.numberOfSides; i++) {
            shapePropreties.drawingContext.lineTo(center.x - radiuses.x * Math.sin(i * angle), center.y - radiuses.y * Math.cos(i * angle));
        }

        if (shapePropreties.traceType !== TraceType.Bordered) {
            this.setFillColor(shapePropreties.drawingContext, shapePropreties.mainColor);
            shapePropreties.drawingContext.fill();
        }

        if (shapePropreties.traceType !== TraceType.FilledNoBordered) {
            this.setStrokeColor(shapePropreties.drawingContext, shapePropreties.secondaryColor);
            shapePropreties.drawingContext.stroke();
        }
        shapePropreties.drawingContext.restore();
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
