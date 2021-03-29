import { Injectable } from '@angular/core';
import { SelectionPropreties } from '@app/classes/commands/selection-command/selection-command';
import { SelectionTool } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subscription } from 'rxjs';
import { MoveSelectionService } from '../move-selection.service';

@Injectable({
    providedIn: 'root',
})
export class RectangleSelectionService extends SelectionTool {
    subscription: Subscription;

    constructor(
        drawingService: DrawingService,
        rectangleDrawingService: RectangleDrawingService,
        undoRedoService: UndoRedoService,
        moveSelectionService: MoveSelectionService,
    ) {
        super(drawingService, rectangleDrawingService, 'Sélection par rectangle', undoRedoService, moveSelectionService);
    }
    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const trueEndCoords = this.shapeService.getTrueEndCoords(begin, end, this.shapeService.alternateShape);
        this.shapeService.drawPerimeter(ctx, begin, trueEndCoords);
    }

    fillWithWhite(selectionPropreties: SelectionPropreties): void {
        if (!selectionPropreties.selectionCtx) return;
        selectionPropreties.selectionCtx.fillStyle = 'white';
        selectionPropreties.selectionCtx.beginPath();
        selectionPropreties.selectionCtx.rect(
            selectionPropreties.topLeft.x,
            selectionPropreties.topLeft.y,
            selectionPropreties.bottomRight.x - selectionPropreties.topLeft.x,
            selectionPropreties.bottomRight.y - selectionPropreties.topLeft.y,
        );
        selectionPropreties.selectionCtx.fill();
    }

    drawSelection(selectionPropreties: SelectionPropreties): void {
        if (selectionPropreties.selectionCtx === undefined) return;
        selectionPropreties.selectionCtx.putImageData(
            selectionPropreties.imageData,
            selectionPropreties.finalTopLeft.x,
            selectionPropreties.finalTopLeft.y,
        );
    }
}
