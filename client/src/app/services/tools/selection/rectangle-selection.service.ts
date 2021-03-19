import { Injectable } from '@angular/core';
import { SelectionCommand, SelectionPropreties, SelectionType } from '@app/classes/commands/selection-command/selection-command';
import { SelectionTool } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subscription } from 'rxjs';
import { SelectionService } from './selection.service';

@Injectable({
    providedIn: 'root',
})
export class RectangleSelectionService extends SelectionTool {
    subscription: Subscription;

    constructor(
        drawingService: DrawingService,
        rectangleDrawingService: RectangleDrawingService,
        undoRedoService: UndoRedoService,
        private selectionService: SelectionService,
    ) {
        super(drawingService, rectangleDrawingService, 'Sélection par rectangle', undoRedoService);
        this.listenToNewRectangleDrawingCommands();
    }

    listenToNewRectangleDrawingCommands(): void {
        this.subscription = this.selectionService.newRectangleSelection().subscribe((selectionPropreties) => {
            this.fillWithWhite(selectionPropreties);
            this.drawSelection(selectionPropreties);
        });
    }

    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const trueEndCoords = this.shapeService.getTrueEndCoords(begin, end, this.shapeService.alternateShape);
        this.shapeService.drawPerimeter(ctx, begin, trueEndCoords);
    }

    fillWithWhite(selectionPropreties: SelectionPropreties): void {
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

    draw(ctx: CanvasRenderingContext2D): void {
        const rectangleSelectionCommand: SelectionCommand = new SelectionCommand(this.loadUpProperties(ctx), this);
        rectangleSelectionCommand.execute();
        if (ctx === this.drawingService.baseCtx) this.undoRedoService.addCommand(rectangleSelectionCommand);
    }

    loadUpProperties(ctx: CanvasRenderingContext2D): SelectionPropreties {
        return {
            selectionType: SelectionType.Rectangle,
            selectionCtx: ctx,
            imageData: this.data,
            topLeft: this.initialTopLeft,
            bottomRight: this.initialBottomRight,
            finalTopLeft: this.finalTopLeft,
            finalBottomRight: this.finalBottomRight,
        };
    }

    drawSelection(selectionPropreties: SelectionPropreties): void {
        selectionPropreties.selectionCtx.putImageData(
            selectionPropreties.imageData,
            selectionPropreties.finalTopLeft.x,
            selectionPropreties.finalTopLeft.y,
        );
    }
}
