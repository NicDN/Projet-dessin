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
export class RectangleSelectionService extends SelectionTool {
    constructor(
        drawingService: DrawingService,
        rectangleDrawingService: RectangleDrawingService,
        undoRedoService: UndoRedoService,
        moveSelectionService: MoveSelectionService,
        resizeSelectionService: ResizeSelectionService,
    ) {
        super(drawingService, rectangleDrawingService, 'Sélection par rectangle', undoRedoService, moveSelectionService, resizeSelectionService);
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
            selectionPropreties.initialTopLeft.x,
            selectionPropreties.initialTopLeft.y,
            selectionPropreties.initialBottomRight.x - selectionPropreties.initialTopLeft.x,
            selectionPropreties.initialBottomRight.y - selectionPropreties.initialTopLeft.y,
        );
        selectionPropreties.selectionCtx.fill();
    }

    drawSelection(selectionPropreties: SelectionPropreties): void {
        if (!selectionPropreties.selectionCtx) return;
        selectionPropreties.selectionCtx.save();
        const image: HTMLCanvasElement = document.createElement('canvas');
        image.width = selectionPropreties.initialBottomRight.x - selectionPropreties.initialTopLeft.x;
        image.height = selectionPropreties.initialBottomRight.y - selectionPropreties.initialTopLeft.y;
        (image.getContext('2d') as CanvasRenderingContext2D).putImageData(selectionPropreties.imageData, 0, 0);
        const ratioX: number =
            (selectionPropreties.finalBottomRight.x - selectionPropreties.finalTopLeft.x) /
            (selectionPropreties.initialBottomRight.x - selectionPropreties.initialTopLeft.x);

        const ratioY: number =
            (selectionPropreties.finalBottomRight.y - selectionPropreties.finalTopLeft.y) /
            (selectionPropreties.initialBottomRight.y - selectionPropreties.initialTopLeft.y);

        selectionPropreties.selectionCtx.translate(selectionPropreties.finalTopLeft.x, selectionPropreties.finalTopLeft.y);
        selectionPropreties.selectionCtx.scale(ratioX, ratioY);
        selectionPropreties.selectionCtx.translate(-selectionPropreties.finalTopLeft.x, -selectionPropreties.finalTopLeft.y);

        selectionPropreties.selectionCtx.drawImage(image, selectionPropreties.finalTopLeft.x, selectionPropreties.finalTopLeft.y);
        selectionPropreties.selectionCtx.restore();
    }
}
