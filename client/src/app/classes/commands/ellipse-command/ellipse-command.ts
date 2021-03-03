import { Color } from '@app/classes/color';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { EllipseDrawingService } from '@app/services/tools/shape/ellipse/ellipse-drawing.service';

export interface EllipsePropreties {
    drawingContext: CanvasRenderingContext2D;
    beginCoords: Vec2;
    endCoords: Vec2;
    drawingThickness: number;
    mainColor: Color;
    secondaryColor: Color;
    isAlternateShape: boolean;
    traceType: number;
}

export class EllipseCommand extends AbstractCommand {
    constructor(private ellipseDrawingService: EllipseDrawingService, private ellipsePropreties: EllipsePropreties) {
        super();
    }

    execute(): void {
        this.ellipseDrawingService.alternateShape = this.ellipsePropreties.isAlternateShape;
        const actualEndCoords: Vec2 = this.ellipseDrawingService.getTrueEndCoords(
            this.ellipsePropreties.beginCoords,
            this.ellipsePropreties.endCoords,
        );
        const center: Vec2 = this.ellipseDrawingService.getCenterCoords(this.ellipsePropreties.beginCoords, actualEndCoords);
        const radiuses: Vec2 = {
            x: this.ellipseDrawingService.getRadius(this.ellipsePropreties.beginCoords.x, actualEndCoords.x),
            y: this.ellipseDrawingService.getRadius(this.ellipsePropreties.beginCoords.y, actualEndCoords.y),
        };

        this.ellipsePropreties.drawingContext.save();
        this.ellipseDrawingService.setContextParameters(this.ellipsePropreties.drawingContext, this.ellipsePropreties.drawingThickness);
        this.ellipsePropreties.drawingContext.beginPath();

        this.ellipseDrawingService.adjustToBorder(
            this.ellipsePropreties.drawingContext,
            radiuses,
            this.ellipsePropreties.beginCoords,
            actualEndCoords,
        );

        this.ellipsePropreties.drawingContext.ellipse(center.x, center.y, radiuses.x, radiuses.y, 0, 0, 2 * Math.PI);

        if (this.ellipsePropreties.traceType !== TraceType.Bordered) {
            this.ellipseDrawingService.setFillColor(this.ellipsePropreties.drawingContext, this.ellipsePropreties.mainColor);
            this.ellipsePropreties.drawingContext.fill();
        }
        if (this.ellipsePropreties.traceType !== TraceType.FilledNoBordered) {
            this.ellipseDrawingService.setStrokeColor(this.ellipsePropreties.drawingContext, this.ellipsePropreties.secondaryColor);
            this.ellipsePropreties.drawingContext.stroke();
        }
        this.ellipsePropreties.drawingContext.restore();
    }
}
