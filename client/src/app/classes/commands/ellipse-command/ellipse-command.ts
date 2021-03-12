import { Color } from '@app/classes/color';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
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
        this.ellipseDrawingService.drawEllipse(this.ellipsePropreties);
    }
}
