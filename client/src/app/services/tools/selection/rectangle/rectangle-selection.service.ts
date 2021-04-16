import { Injectable } from '@angular/core';
import { SelectionProperties } from '@app/classes/commands/selection-command/selection-command';
import { SelectionTool } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetSelectionService } from '@app/services/tools/selection/magnet-selection.service';
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
        magnetSelectionService: MagnetSelectionService,
    ) {
        super(
            drawingService,
            rectangleDrawingService,
            'Sélection par rectangle',
            undoRedoService,
            moveSelectionService,
            resizeSelectionService,
            magnetSelectionService,
        );
    }
    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const trueEndCoords = this.shapeService.getTrueEndCoords(begin, end, this.shapeService.alternateShape);
        this.shapeService.drawPerimeter(ctx, begin, trueEndCoords);
    }

    fillWithWhite(selectionPropreties: SelectionProperties): void {
        if (!selectionPropreties.selectionCtx) return;
        selectionPropreties.selectionCtx.fillStyle = 'white';
        selectionPropreties.selectionCtx.beginPath();
        selectionPropreties.selectionCtx.rect(
            selectionPropreties.coords.initialTopLeft.x,
            selectionPropreties.coords.initialTopLeft.y,
            selectionPropreties.coords.initialBottomRight.x - selectionPropreties.coords.initialTopLeft.x,
            selectionPropreties.coords.initialBottomRight.y - selectionPropreties.coords.initialTopLeft.y,
        );
        selectionPropreties.selectionCtx.fill();
    }

    drawSelection(selectionPropreties: SelectionProperties): void {
        if (!selectionPropreties.selectionCtx) return;
        selectionPropreties.selectionCtx.save();
        const image: HTMLCanvasElement = document.createElement('canvas');
        image.width = selectionPropreties.coords.initialBottomRight.x - selectionPropreties.coords.initialTopLeft.x;
        image.height = selectionPropreties.coords.initialBottomRight.y - selectionPropreties.coords.initialTopLeft.y;
        (image.getContext('2d') as CanvasRenderingContext2D).putImageData(selectionPropreties.imageData, 0, 0);

        this.scaleContext(selectionPropreties.coords, selectionPropreties.selectionCtx);

        selectionPropreties.selectionCtx.drawImage(image, selectionPropreties.coords.finalTopLeft.x, selectionPropreties.coords.finalTopLeft.y);
        selectionPropreties.selectionCtx.restore();
    }
}
