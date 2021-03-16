import { Color } from '@app/classes/color';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { TraceTool } from '@app/classes/trace-tool';
import { Vec2 } from '@app/classes/vec2';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { LineService } from '@app/services/tools/line/line.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';

export interface DrawingToolPropreties {
    drawingContext: CanvasRenderingContext2D;
    drawingPath: Vec2[];
    drawingThickness: number;
    drawingColor?: Color;
    drawWithJunction?: boolean;
    junctionDiameter?: number;
}

export class DrawingToolCommand extends AbstractCommand {
    constructor(private traceTool: TraceTool, private drawingToolPropreties: DrawingToolPropreties) {
        super();
    }
    execute(): void {
        if (this.traceTool instanceof PencilService) (this.traceTool as PencilService).executeDrawLine(this.drawingToolPropreties);
        if (this.traceTool instanceof EraserService) (this.traceTool as EraserService).executeErase(this.drawingToolPropreties);
        if (this.traceTool instanceof LineService) (this.traceTool as LineService).drawLineExecute(this.drawingToolPropreties);
    }
}
