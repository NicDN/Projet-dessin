import { Injectable } from '@angular/core';
import { SelectionPropreties } from '@app/classes/commands/selection-command/selection-command';
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
export class EllipseSelectionService extends SelectionTool {
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
            'Sélection par ellipse',
            undoRedoService,
            moveSelectionService,
            resizeSelectionService,
            magnetSelectionService,
        );
    }

    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const trueEndCoords = this.shapeService.getTrueEndCoords(begin, end, this.shapeService.alternateShape);
        this.shapeService.drawEllipticalPerimeter(ctx, begin, trueEndCoords);
    }

    fillWithWhite(selectionPropreties: SelectionPropreties): void {
        const centerCoords: Vec2 = this.shapeService.getCenterCoords(selectionPropreties.initialTopLeft, selectionPropreties.initialBottomRight);
        if (!selectionPropreties.selectionCtx) return;
        selectionPropreties.selectionCtx.fillStyle = 'white';
        selectionPropreties.selectionCtx.beginPath();
        selectionPropreties.selectionCtx.ellipse(
            centerCoords.x,
            centerCoords.y,
            (selectionPropreties.initialBottomRight.x - selectionPropreties.initialTopLeft.x) / 2 - 1,
            (selectionPropreties.initialBottomRight.y - selectionPropreties.initialTopLeft.y) / 2 - 1,
            0,
            0,
            2 * Math.PI,
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
        const centerCoords: Vec2 = this.shapeService.getCenterCoords(selectionPropreties.finalTopLeft, selectionPropreties.finalBottomRight);

        const ratioX: number =
            (selectionPropreties.finalBottomRight.x - selectionPropreties.finalTopLeft.x) /
            (selectionPropreties.initialBottomRight.x - selectionPropreties.initialTopLeft.x);

        const ratioY: number =
            (selectionPropreties.finalBottomRight.y - selectionPropreties.finalTopLeft.y) /
            (selectionPropreties.initialBottomRight.y - selectionPropreties.initialTopLeft.y);

        selectionPropreties.selectionCtx.beginPath();
        selectionPropreties.selectionCtx.ellipse(
            centerCoords.x,
            centerCoords.y,
            Math.abs(selectionPropreties.finalBottomRight.x - selectionPropreties.finalTopLeft.x) / 2,
            Math.abs(selectionPropreties.finalBottomRight.y - selectionPropreties.finalTopLeft.y) / 2,
            0,
            0,
            2 * Math.PI,
        );
        selectionPropreties.selectionCtx.clip();

        selectionPropreties.selectionCtx.translate(selectionPropreties.finalTopLeft.x, selectionPropreties.finalTopLeft.y);
        selectionPropreties.selectionCtx.scale(ratioX, ratioY);
        selectionPropreties.selectionCtx.translate(-selectionPropreties.finalTopLeft.x, -selectionPropreties.finalTopLeft.y);

        selectionPropreties.selectionCtx.drawImage(image, selectionPropreties.finalTopLeft.x, selectionPropreties.finalTopLeft.y);
        selectionPropreties.selectionCtx.restore();
    }
}
