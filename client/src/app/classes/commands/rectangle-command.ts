import { Color } from '@app/classes/color';
import { TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { AbstractCommand } from './abstract-command';
export class RectangleCommand extends AbstractCommand {
    drawingContext: CanvasRenderingContext2D;
    begin: Vec2;
    end: Vec2;
    drawingPath: Vec2[];
    drawingThickness: number;
    mainColor: string;
    secondaryColor: string;
    drawingGlobalAlpha: number;
    rectangleDrawingService: RectangleDrawingService;
    isAlternateShape: boolean;

    constructor(
        ctx: CanvasRenderingContext2D,
        begin: Vec2,
        end: Vec2,
        thickness: number,
        mainColor: string,
        secondaryColor: string,
        globalAlpha: number,
        rectangleDrawingService: RectangleDrawingService,
        isAlternateShape: boolean,
    ) {
        super();
        this.drawingContext = ctx;
        this.begin = begin;
        this.end = end;
        this.drawingThickness = thickness;
        this.mainColor = mainColor;
        this.secondaryColor = secondaryColor;
        this.drawingGlobalAlpha = globalAlpha;
        this.rectangleDrawingService = rectangleDrawingService;
        this.isAlternateShape = isAlternateShape;
    }
    execute(): void {
        this.rectangleDrawingService.alternateShape = this.isAlternateShape;
        const trueEndCoords: Vec2 = this.rectangleDrawingService.getTrueEndCoords(this.begin, this.end);
        const sideLengths: Vec2 = { x: trueEndCoords.x - this.begin.x, y: trueEndCoords.y - this.begin.y };
        const adjustedBeginCoords: Vec2 = { x: this.begin.x, y: this.begin.y };

        this.drawingContext.save();
        this.rectangleDrawingService.setContextParameters(this.drawingContext, this.drawingThickness);
        this.drawingContext.beginPath();

        this.rectangleDrawingService.adjustToBorder(this.drawingContext, sideLengths, adjustedBeginCoords, trueEndCoords);
        this.drawingContext.rect(adjustedBeginCoords.x, adjustedBeginCoords.y, sideLengths.x, sideLengths.y);

        const mainColor: Color = { rgbValue: this.mainColor, opacity: this.drawingGlobalAlpha };
        const secondaryColor: Color = { rgbValue: this.secondaryColor, opacity: 1 };

        if (this.rectangleDrawingService.traceType !== TraceType.Bordered) {
            this.rectangleDrawingService.setFillColor(this.drawingContext, mainColor);
            this.drawingContext.fill();
        }
        if (this.rectangleDrawingService.traceType !== TraceType.FilledNoBordered) {
            this.rectangleDrawingService.setStrokeColor(this.drawingContext, secondaryColor);
            this.drawingContext.stroke();
        }
        this.drawingContext.restore();
    }
}
