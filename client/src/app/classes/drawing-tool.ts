import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Tool } from './tool';

export abstract class DrawingTool extends Tool {
    constructor(drawingService: DrawingService, colorService: ColorService, toolName: string) {
        super(drawingService, colorService, toolName);
    }
    abstract draw(event: MouseEvent): void;
}
