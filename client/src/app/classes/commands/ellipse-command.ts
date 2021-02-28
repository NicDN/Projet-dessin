import { EllipseDrawingService } from '@app/services/tools/shape/ellipse/ellipse-drawing.service';
import { Color } from '@app/classes/color';
import { TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { AbstractCommand } from './abstract-command';

export class EllipseCommand extends AbstractCommand {
    drawingContext: CanvasRenderingContext2D;
    begin: Vec2;
    end: Vec2;
    drawingPath: Vec2[];
    drawingThickness: number;
    mainColor: string;
    secondaryColor: string;
    drawingGlobalAlpha: number;
    ellipseDrawingService: EllipseDrawingService;

    constructor(
        ctx: CanvasRenderingContext2D,
        begin: Vec2,
        end: Vec2,
        thickness: number,
        mainColor: string,
        secondaryColor: string,
        globalAlpha: number,
        ellipseDrawingService: EllipseDrawingService,
    ) {
        super();
        this.drawingContext = ctx;
        this.begin = begin;
        this.end = end;
        this.drawingThickness = thickness;
        this.mainColor = mainColor;
        this.secondaryColor = secondaryColor;
        this.drawingGlobalAlpha = globalAlpha;
        this.ellipseDrawingService = ellipseDrawingService;
    }

    execute(): void {
        const actualEndCoords: Vec2 = this.ellipseDrawingService.getTrueEndCoords(this.begin, this.end);
        const center: Vec2 = this.ellipseDrawingService.getCenterCoords(this.begin, actualEndCoords);
        const radiuses: Vec2 = {
            x: this.ellipseDrawingService.getRadius(this.begin.x, actualEndCoords.x),
            y: this.ellipseDrawingService.getRadius(this.begin.y, actualEndCoords.y),
        };

        this.drawingContext.save();
        this.ellipseDrawingService.setContextParameters(this.drawingContext, this.drawingThickness);
        this.drawingContext.beginPath();

        this.ellipseDrawingService.adjustToBorder(this.drawingContext, radiuses, this.begin, actualEndCoords);

        this.drawingContext.ellipse(center.x, center.y, radiuses.x, radiuses.y, 0, 0, 2 * Math.PI);

        const mainColor: Color = { rgbValue: this.mainColor, opacity: this.drawingGlobalAlpha };
        const secondaryColor: Color = { rgbValue: this.secondaryColor, opacity: 1 };

        if (this.ellipseDrawingService.traceType !== TraceType.Bordered) {
            this.ellipseDrawingService.setFillColor(this.drawingContext, mainColor);
            this.drawingContext.fill();
        }
        if (this.ellipseDrawingService.traceType !== TraceType.FilledNoBordered) {
            this.ellipseDrawingService.setStrokeColor(this.drawingContext, secondaryColor);
            this.drawingContext.stroke();
        }
        this.drawingContext.restore();
    }
}

