import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DrawingTool } from './drawing-tool';

export abstract class TraceTool extends DrawingTool {
    constructor(drawingService: DrawingService, colorService: ColorService, toolName: string) {
        super(drawingService, colorService, toolName);
    }
    abstract draw(event: MouseEvent): void;
}
