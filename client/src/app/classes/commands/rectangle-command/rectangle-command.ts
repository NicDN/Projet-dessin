import { Color } from '@app/classes/color';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { Vec2 } from '@app/classes/vec2';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';

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
        this.rectangleDrawingService.drawRectangle(this.rectanglePropreties);
    }
}
