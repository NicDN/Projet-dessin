import { Injectable } from '@angular/core';
import { SelectionPropreties, SelectionType } from '@app/classes/commands/selection-command/selection-command';
import { SelectionTool } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class EllipseSelectionService extends SelectionTool {
    subscription: Subscription;

    constructor(drawingService: DrawingService, rectangleDrawingService: RectangleDrawingService, undoRedoService: UndoRedoService) {
        super(drawingService, rectangleDrawingService, 'Sélection par ellipse', undoRedoService);
    }

    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const trueEndCoords = this.shapeService.getTrueEndCoords(begin, end, this.shapeService.alternateShape);
        this.shapeService.drawEllipticalPerimeter(ctx, begin, trueEndCoords);
    }

    fillWithWhite(selectionPropreties: SelectionPropreties): void {
        const centerCoords: Vec2 = this.shapeService.getCenterCoords(selectionPropreties.topLeft, selectionPropreties.bottomRight);

        selectionPropreties.selectionCtx.fillStyle = 'white';
        selectionPropreties.selectionCtx.beginPath();
        selectionPropreties.selectionCtx.ellipse(
            centerCoords.x,
            centerCoords.y,
            (selectionPropreties.bottomRight.x - selectionPropreties.topLeft.x) / 2,
            (selectionPropreties.bottomRight.y - selectionPropreties.topLeft.y) / 2,
            0,
            0,
            2 * Math.PI,
        );
        selectionPropreties.selectionCtx.fill();
    }

    drawSelection(selectionPropreties: SelectionPropreties): void {
        selectionPropreties.selectionCtx.save();
        const image: HTMLCanvasElement = document.createElement('canvas');
        image.width = selectionPropreties.finalBottomRight.x - selectionPropreties.finalTopLeft.x;
        image.height = selectionPropreties.finalBottomRight.y - selectionPropreties.finalTopLeft.y;
        (image.getContext('2d') as CanvasRenderingContext2D).putImageData(selectionPropreties.imageData, 0, 0);
        const centerCoords: Vec2 = this.shapeService.getCenterCoords(selectionPropreties.finalTopLeft, selectionPropreties.finalBottomRight);

        selectionPropreties.selectionCtx.beginPath();
        selectionPropreties.selectionCtx.ellipse(
            centerCoords.x,
            centerCoords.y,
            (selectionPropreties.finalBottomRight.x - selectionPropreties.finalTopLeft.x) / 2,
            (selectionPropreties.finalBottomRight.y - selectionPropreties.finalTopLeft.y) / 2,
            0,
            0,
            2 * Math.PI,
        );
        selectionPropreties.selectionCtx.clip();
        selectionPropreties.selectionCtx.drawImage(image, selectionPropreties.finalTopLeft.x, selectionPropreties.finalTopLeft.y);
        selectionPropreties.selectionCtx.restore();
    }

    loadUpProperties(ctx: CanvasRenderingContext2D): SelectionPropreties {
        return {
            selectionType: SelectionType.Ellipse,
            selectionCtx: ctx,
            imageData: this.data,
            topLeft: this.initialTopLeft,
            bottomRight: this.initialBottomRight,
            finalTopLeft: this.finalTopLeft,
            finalBottomRight: this.finalBottomRight,
        };
    }
}
