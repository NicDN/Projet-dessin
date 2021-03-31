import { Injectable } from '@angular/core';
import { SelectionPropreties } from '@app/classes/commands/selection-command/selection-command';
import { SelectionTool } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MoveSelectionService } from '@app/services/tools/selection/move-selection.service';
import { ResizeSelectionService } from '@app/services/tools/selection/resize-selection.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class LassoSelectionService extends SelectionTool {
    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        throw new Error('Method not implemented.');
    }
    drawSelection(selectionPropreties: SelectionPropreties): void {
        throw new Error('Method not implemented.');
    }
    fillWithWhite(selectionPropreties: SelectionPropreties): void {
        throw new Error('Method not implemented.');
    }

    constructor(
        drawingService: DrawingService,
        rectangleDrawingService: RectangleDrawingService,
        undoRedoService: UndoRedoService,
        moveSelectionService: MoveSelectionService,
        resizeSelectionService: ResizeSelectionService,
    ) {
        super(
            drawingService,
            rectangleDrawingService,
            'Sélection par lasso polygonal',
            undoRedoService,
            moveSelectionService,
            resizeSelectionService,
        );
    }
}
