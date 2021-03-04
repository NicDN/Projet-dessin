import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { AbstractCommand } from './abstract-command';

export interface PencilPropreties {
    drawingContext: CanvasRenderingContext2D;
    drawingPath: Vec2[];
    drawingThickness: number;
    drawingColor: Color;
}

export class PencilCommand extends AbstractCommand {
    constructor(private pencilService: PencilService, private pencilPropreties: PencilPropreties) {
        super();
    }
    execute(): void {
        this.pencilService.executeDrawLine(this.pencilPropreties);
    }
}
