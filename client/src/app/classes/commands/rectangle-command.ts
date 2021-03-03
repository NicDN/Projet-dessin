import { Color } from '@app/classes/color';
import { TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { AbstractCommand } from './abstract-command';

export interface RectanglePropreties {
    drawingCtx: CanvasRenderingContext2D;
    beginCoords: Vec2;
    endCoords: Vec2;
    drawingThickness: number;
    mainColor: Color;
    secondaryColor: Color;
    isAlternateShape: boolean;
    traceType: number;
}

export class RectangleCommand extends AbstractCommand {
    constructor(private rectangleDrawingService: RectangleDrawingService, private rectanglePropreties: RectanglePropreties) {
        super();
    }
    execute(): void {
        this.rectangleDrawingService.alternateShape = this.rectanglePropreties.isAlternateShape;
        const trueEndCoords: Vec2 = this.rectangleDrawingService.getTrueEndCoords(
            this.rectanglePropreties.beginCoords,
            this.rectanglePropreties.endCoords,
        );
        const sideLengths: Vec2 = {
            x: trueEndCoords.x - this.rectanglePropreties.beginCoords.x,
            y: trueEndCoords.y - this.rectanglePropreties.beginCoords.y,
        };
        const adjustedBeginCoords: Vec2 = { x: this.rectanglePropreties.beginCoords.x, y: this.rectanglePropreties.beginCoords.y };

        this.rectanglePropreties.drawingCtx.save();
        this.rectangleDrawingService.setContextParameters(this.rectanglePropreties.drawingCtx, this.rectanglePropreties.drawingThickness);
        this.rectanglePropreties.drawingCtx.beginPath();

        this.rectangleDrawingService.adjustToBorder(this.rectanglePropreties.drawingCtx, sideLengths, adjustedBeginCoords, trueEndCoords);
        this.rectanglePropreties.drawingCtx.rect(adjustedBeginCoords.x, adjustedBeginCoords.y, sideLengths.x, sideLengths.y);

        // const mainColor: Color = { rgbValue: this.rectanglePropreties.mainColor, opacity: this.rectanglePropreties.drawingGlobalAlpha };
        // const secondaryColor: Color = { rgbValue: this.rectanglePropreties.secondaryColor, opacity: this.rectanglePropreties.drawingGlobalAlpha };

        if (this.rectanglePropreties.traceType !== TraceType.Bordered) {
            this.rectangleDrawingService.setFillColor(this.rectanglePropreties.drawingCtx, this.rectanglePropreties.mainColor);
            this.rectanglePropreties.drawingCtx.fill();
        }
        if (this.rectanglePropreties.traceType !== TraceType.FilledNoBordered) {
            this.rectangleDrawingService.setStrokeColor(this.rectanglePropreties.drawingCtx, this.rectanglePropreties.secondaryColor);
            this.rectanglePropreties.drawingCtx.stroke();
        }
        this.rectanglePropreties.drawingCtx.restore();
    }
}
