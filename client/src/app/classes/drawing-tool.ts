import { Tool } from './tool';
export class DrawingTool extends Tool {
    public thickness: number;
    constructor(protected drawingService: DrawingService, protected colorService: ColorService, toolName: string) {
        super(drawingService, toolName);
    }
}
