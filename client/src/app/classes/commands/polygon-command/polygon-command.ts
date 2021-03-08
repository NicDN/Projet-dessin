import { Color } from '@app/classes/color';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { Vec2 } from '@app/classes/vec2';
import { PolygonService } from '@app/services/tools/shape/polygon/polygon.service';

export interface PolygonPropreties {
    drawingCtx: CanvasRenderingContext2D;
    beginCoords: Vec2;
    endCoords: Vec2;
    drawingThickness: number;
    mainColor: Color;
    secondaryColor: Color;
    isAlternateShape: boolean;
    traceType: number;
}

export class PolygonCommand extends AbstractCommand {
    constructor(private rectangleDrawingService: PolygonService, private rectanglePropreties: PolygonPropreties) {
        super();
    }
    execute(): void {
        this.rectangleDrawingService.drawRectangle(this.rectanglePropreties);
    }
}
