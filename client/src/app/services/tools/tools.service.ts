import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { LineService } from './drawing-tool/line/line.service';
import { PencilService } from './drawing-tool/pencil/pencil-service';
import { EraserService } from './eraser/eraser.service';
import { EllipseDrawingService } from './shape/ellipse/ellipse-drawing.service';
import { RectangleDrawingService } from './shape/rectangle/rectangle-drawing.service';

@Injectable({
    providedIn: 'root',
})
export class ToolsService {
    // private tools: Tool[];
    currentTool: Tool;

    constructor(
        public pencilService: PencilService,
        public ellipseDrawingService: EllipseDrawingService,
        public rectangleDrawingService: RectangleDrawingService,
        public lineService: LineService,
        public eraserService: EraserService,
    ) {
        // this.tools = [pencilService, eraserService, ellipseDrawingService, rectangleDrawingService, lineService];
        // this.currentTool = this.tools[0];
    }

    // a voir si on fait correspondre avec le id
    setCurrentTool(tool: Tool): void {
        this.currentTool = tool;
    }
}
