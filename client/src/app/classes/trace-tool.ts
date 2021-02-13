import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DrawingTool } from './drawing-tool';
import { Vec2 } from './vec2';

export abstract class TraceTool extends DrawingTool {
    constructor(drawingService: DrawingService, colorService: ColorService, toolName: string) {
        super(drawingService, colorService, toolName);
    }
    abstract drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void;
}
