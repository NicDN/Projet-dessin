import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { EllipseDrawingService } from './drawing-tool/ellipse/ellipse-drawing.service';
import { LineService } from './drawing-tool/line/line.service';
import { PencilService } from './drawing-tool/pencil/pencil-service';
import { RectangleDrawingService } from './drawing-tool/rectangle/rectangle-drawing.service';
import { EraserService } from './eraser/eraser.service';

@Injectable({
    providedIn: 'root',
})
export class ToolsService {
    private tools: Tool[];
    currentTool: Tool;

    constructor(
        ellipseDrawingService: EllipseDrawingService,
        rectangleDrawingService: RectangleDrawingService,
        lineService: LineService,
        pencilService: PencilService,
        eraserService: EraserService,
    ) {
        this.tools = [pencilService, eraserService, ellipseDrawingService, rectangleDrawingService, lineService];
        this.currentTool = this.tools[0];
    }

    // a voir si on fait correspondre avec le id
    setCurrentTool(id: number): void {
        this.currentTool = this.tools[id];
    }
}
