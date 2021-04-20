import { Injectable } from '@angular/core';
import { SelectionTool } from '@app/classes/selection-tool';
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

    selectedSelectionService: Tool = this.rectangleSelectionService;

    setCurrentTool(tool: Tool): void {
        this.clearPreview(tool);
        this.cancelSelectionOnToolChange(tool);
        this.registerTextCommandOnToolChange();
        this.removeLinePreview();

        this.currentTool = tool;

        this.handleStampCurrentTool();
        this.handleGridCurrentTool();
        this.handleSelectionCurrentTool(tool);

        // to notifiy attributes panel component that the current tool has changed
        this.subject.next(tool);
    }

    private clearPreview(tool: Tool): void {
        if (this.drawingService.previewCanvas === undefined) return;
        if (this.currentTool instanceof SelectionTool) return;
        if (this.currentTool instanceof GridService && tool instanceof SelectionTool) return;

        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    private handleSelectionCurrentTool(tool: Tool): void {
        if (tool instanceof SelectionTool) {
            this.selectedSelectionService = tool;
        }
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
        if (this.currentTool !== this.lineService && this.currentTool !== this.lassoSelectionService) {
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

    private cancelSelectionOnToolChange(incomingTool: Tool): void {
        if (this.preventCancelSelectionIfUsingGrid(incomingTool)) {
            return;
        }

        if (this.currentTool instanceof SelectionTool) {
            (this.currentTool as SelectionTool).cancelSelection();
        }
    }

    private preventCancelSelectionIfUsingGrid(incomingTool: Tool): boolean {
        if (
            incomingTool === this.gridService &&
            (this.currentTool === this.ellipseSelectionService ||
                this.currentTool === this.rectangleSelectionService ||
                this.currentTool === this.ellipseSelectionService)
        ) {
            return true;
        }
        return false;
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
