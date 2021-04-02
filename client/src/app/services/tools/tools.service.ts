import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { GridService } from '@app/services/grid/grid.service';
import { EyeDropperService } from '@app/services/tools/eye-dropper/eye-dropper.service';
import { LassoSelectionService } from '@app/services/tools/selection/lasso/lasso-selection.service';
import { SprayCanService } from '@app/services/tools/spray-can/spray-can.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextService } from '@app/services/tools/text/text.service';
import { Observable, Subject } from 'rxjs';
import { FillDripService } from './fill-drip/fill-drip.service';
import { EllipseSelectionService } from './selection/ellipse/ellipse-selection.service';
import { RectangleSelectionService } from './selection/rectangle/rectangle-selection.service';
import { EllipseDrawingService } from './shape/ellipse/ellipse-drawing.service';
import { PolygonService } from './shape/polygon/polygon.service';
import { RectangleDrawingService } from './shape/rectangle/rectangle-drawing.service';
import { EraserService } from './trace-tool/eraser/eraser.service';
import { LineService } from './trace-tool/line/line.service';
import { PencilService } from './trace-tool/pencil/pencil.service';
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
        public polygonService: PolygonService,
        public lineService: LineService,
        public eraserService: EraserService,
        public sprayCanService: SprayCanService,
        public eyeDropperService: EyeDropperService,
        public rectangleSelectionService: RectangleSelectionService,
        public ellipseSelectionService: EllipseSelectionService,
        public lassoSelectionService: LassoSelectionService,
        public fillDripService: FillDripService,
        public textService: TextService,
        public stampService: StampService,
        public gridService: GridService,
    ) {
        this.currentTool = pencilService;
    }

    setCurrentTool(tool: Tool): void {
        this.ellipseSelectionService.cancelSelection();
        this.rectangleSelectionService.cancelSelection();
        if (this.currentTool === this.lineService || this.currentTool === this.lassoSelectionService) {
            this.lineService.clearPath();
            this.lineService.updatePreview();
        }
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
