import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TraceToolPropreties } from './commands/trace-tool-command/trace-tool-command';
import { DrawingTool } from './drawing-tool';
import { Vec2 } from './vec2';

export abstract class TraceTool extends DrawingTool {
    constructor(drawingService: DrawingService, colorService: ColorService, toolName: string) {
        super(drawingService, colorService, toolName);
    }
    protected drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        return;
    }

    drawTrace(traceToolPropreties: TraceToolPropreties): void {
        return;
    }
}
