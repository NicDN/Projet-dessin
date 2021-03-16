import { Color } from '@app/classes/color';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingToolService } from '@app/services/tools/drawing-tool/drawing-tool.service';

export enum TraceToolType {
    Pencil = 1,
    Eraser = 2,
    Line = 3,
}

export interface DrawingToolPropreties {
    traceToolType: TraceToolType;
    drawingContext: CanvasRenderingContext2D;
    drawingPath: Vec2[];
    drawingThickness: number;
    drawingColor?: Color;
    drawWithJunction?: boolean;
    junctionDiameter?: number;
}

export class DrawingToolCommand extends AbstractCommand {
    constructor(private drawingToolPropreties: DrawingToolPropreties, private drawingToolService: DrawingToolService) {
        super();
    }
    execute(): void {
        if (this.drawingToolPropreties.traceToolType === TraceToolType.Pencil) {
            this.drawingToolService.sendDrawingPencilNotifs(this.drawingToolPropreties);
        }

        if (this.drawingToolPropreties.traceToolType === TraceToolType.Eraser) {
            this.drawingToolService.sendDrawingEraserNotifs(this.drawingToolPropreties);
        }

        if (this.drawingToolPropreties.traceToolType === TraceToolType.Line) {
            this.drawingToolService.sendDrawingLineNotifs(this.drawingToolPropreties);
        }
    }
}
