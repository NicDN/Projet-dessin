import { Injectable } from '@angular/core';
import { SelectionPropreties } from '@app/classes/commands/selection-command/selection-command';
import { TraceToolPropreties } from '@app/classes/commands/trace-tool-command/trace-tool-command';
import { SelectionTool } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MoveSelectionService } from '@app/services/tools/selection/move-selection.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { LineService } from '../../trace-tool/line/line.service';

@Injectable({
    providedIn: 'root',
})
export class LassoSelectionService extends SelectionTool {
    constructor(
        drawingService: DrawingService,
        rectangleDrawingService: RectangleDrawingService,
        undoRedoService: UndoRedoService,
        moveSelectionService: MoveSelectionService,
        private lineService: LineService,
    ) {
        super(drawingService, rectangleDrawingService, 'Sélection par lasso polygonal', undoRedoService, moveSelectionService);
    }

    onMouseDown(event: MouseEvent): void {
        this.lineService.onMouseDown(event);
        this.lineService.loadUpPropreties = this.loadUpPropreties;
        this.drawingService.previewCtx.setLineDash([this.shapeService.DASH_SIZE * 2, this.shapeService.DASH_SIZE]);
        this.drawingService.baseCtx.setLineDash([this.shapeService.DASH_SIZE * 2, this.shapeService.DASH_SIZE]);
    }

    onMouseUp(event: MouseEvent): void {
        this.lineService.onMouseUp(event);
    }

    onMouseMove(event: MouseEvent): void {
        this.lineService.onMouseMove(event);
    }

    private loadUpPropreties(ctx: CanvasRenderingContext2D, path: Vec2[]): TraceToolPropreties {
        return {
            drawingContext: ctx,
            drawingPath: path,
            drawingThickness: 1,
            drawingColor: { rgbValue: 'black', opacity: 1 },
            drawWithJunction: false,
            junctionDiameter: 1,
        };
    }

    onKeyDown(event: KeyboardEvent): void {
        super.onKeyDown(event);
        this.lineService.onKeyDown(event);
    }

    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        throw new Error('Method not implemented.');
    }
    drawSelection(selectionPropreties: SelectionPropreties): void {
        throw new Error('Method not implemented.');
    }
    fillWithWhite(selectionPropreties: SelectionPropreties): void {
        throw new Error('Method not implemented.');
    }
}
