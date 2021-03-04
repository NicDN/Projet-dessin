import { Color } from '@app/classes/color';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { Vec2 } from '@app/classes/vec2';
import { LineService } from '@app/services/tools/line/line.service';

export interface LinePropreties {
    drawingContext: CanvasRenderingContext2D;
    drawingPath: Vec2[];
    drawingThickness: number;
    drawingColor: Color;
    drawWithJunction: boolean;
    junctionDiameter: number;
}

export class LineCommand extends AbstractCommand {
    constructor(private lineService: LineService, private linePropreties: LinePropreties) {
        super();
    }
    execute(): void {
        this.lineService.drawLineExecute(this.linePropreties);
    }
}
