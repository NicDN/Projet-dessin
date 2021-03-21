import { Color } from '@app/classes/color';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { TraceTool } from '@app/classes/trace-tool';
import { Vec2 } from '@app/classes/vec2';

export enum TraceToolType {
    Pencil = 1,
    Eraser = 2,
    Line = 3,
}

export interface TraceToolPropreties {
    drawingContext: CanvasRenderingContext2D;
    drawingPath: Vec2[];
    drawingThickness: number;
    drawingColor?: Color;
    drawWithJunction?: boolean;
    junctionDiameter?: number;
}

export class TraceToolCommand extends AbstractCommand {
    constructor(private drawingToolPropreties: TraceToolPropreties, private traceTool: TraceTool) {
        super();
    }
    execute(): void {
        this.traceTool.drawTrace(this.drawingToolPropreties);
    }
}
