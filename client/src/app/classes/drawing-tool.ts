import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Tool } from './tool';

export class DrawingTool extends Tool {
    thickness: number;
    constructor(drawingService: DrawingService, protected colorService: ColorService, toolName: string) {
        super(drawingService, toolName);
    }
}
