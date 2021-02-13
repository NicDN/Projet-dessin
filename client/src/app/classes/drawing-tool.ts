import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Tool } from './tool';
export class DrawingTool extends Tool {
    thickness: number;
    minThickness: number;
    readonly MAX_VALUE_THICKNESS: number = 50;

    constructor(protected drawingService: DrawingService, protected colorService: ColorService, toolName: string) {
        super(drawingService, toolName);
    }
}
