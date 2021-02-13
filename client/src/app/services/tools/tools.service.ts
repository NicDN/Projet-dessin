import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Observable, Subject } from 'rxjs';
import { LineService } from './drawing-tool/line/line.service';
import { PencilService } from './drawing-tool/pencil/pencil-service';
import { EraserService } from './eraser/eraser.service';
import { EllipseDrawingService } from './shape/ellipse/ellipse-drawing.service';
import { RectangleDrawingService } from './shape/rectangle/rectangle-drawing.service';

@Injectable({
    providedIn: 'root',
})
export class ToolsService {
    currentTool: Tool;
    private subject: Subject<Tool> = new Subject<Tool>();

    constructor(
        public pencilService: PencilService,
        public ellipseDrawingService: EllipseDrawingService,
        public rectangleDrawingService: RectangleDrawingService,
        public lineService: LineService,
        public eraserService: EraserService,
    ) {
        this.currentTool = pencilService;
    }

    setCurrentTool(tool: Tool): void {
        this.currentTool = tool;
        this.subject.next(tool);
    }

    getCurrentTool(): Observable<Tool> {
        return this.subject.asObservable();
    }

    onKeyDown(event: KeyboardEvent): void {
        this.currentTool.onKeyDown(event);
    }

    onKeyUp(event: KeyboardEvent): void {
        this.currentTool.onKeyUp(event);
    }
}
