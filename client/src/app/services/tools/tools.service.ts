import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { EyeDropperService } from '@app/services/tools/eye-dropper/eye-dropper.service';
import { LassoSelectionService } from '@app/services/tools/selection/lasso/lasso-selection.service';
import { SprayCanService } from '@app/services/tools/spray-can/spray-can.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextService } from '@app/services/tools/text/textService/text.service';
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
        private drawingService: DrawingService,
    ) {
        this.currentTool = pencilService;
    }

    setCurrentTool(tool: Tool): void {
        this.cancelSelectionOnToolChange();
        this.registerTextCommandOnToolChange();
        this.removeLinePreview();

        this.currentTool = tool;

        this.handleStampCurrentTool();
        this.handleGridCurrentTool();

        // to notifiy attributes panel component that a the current tool has changed
        this.subject.next(tool);
    }

    private registerTextCommandOnToolChange(): void {
        if (!(this.currentTool instanceof TextService)) {
            return;
        }
        if ((this.textService as TextService).isWriting) {
            (this.textService as TextService).registerTextCommand(this.drawingService.baseCtx, (this.textService as TextService).writtenOnPreview);
        }
    }

    private removeLinePreview(): void {
        if (!(this.currentTool === this.lineService)) {
            return;
        }
        this.lineService.clearPath();
        this.lineService.updatePreview();
    }

    private handleStampCurrentTool(): void {
        this.drawingService.isStamp = false;
        if (this.currentTool === this.stampService) {
            this.drawingService.isStamp = true;
        }
    }

    private handleGridCurrentTool(): void {
        if (this.currentTool instanceof GridService) {
            this.currentTool.gridDrawn = true;
            this.currentTool.drawGrid();
        }
    }

    private cancelSelectionOnToolChange(): void {
        switch (this.currentTool) {
            case this.ellipseSelectionService:
                this.ellipseSelectionService.cancelSelection();
                break;
            case this.rectangleSelectionService:
                this.rectangleSelectionService.cancelSelection();
                break;
            case this.lassoSelectionService:
                this.lassoSelectionService.cancelSelection();
                break;
        }
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
