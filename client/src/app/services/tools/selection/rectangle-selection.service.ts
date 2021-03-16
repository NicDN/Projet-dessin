import { Injectable } from '@angular/core';
import { SelectionCommand } from '@app/classes/commands/selection-command';
import { SelectionTool } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class RectangleSelectionService extends SelectionTool {
    constructor(drawingService: DrawingService, rectangleDrawingService: RectangleDrawingService, undoRedoService: UndoRedoService) {
        super(drawingService, rectangleDrawingService, 'Sélection par rectangle', undoRedoService);
    }

    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const trueEndCoords = this.rectangleDrawingService.getTrueEndCoords(begin, end, this.rectangleDrawingService.alternateShape);
        this.rectangleDrawingService.drawPerimeter(ctx, begin, trueEndCoords);
    }

    fillWithWhite(ctx: CanvasRenderingContext2D, topLeft: Vec2, bottomRight: Vec2): void {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.rect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
        ctx.fill();
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const rectangleSelectionCommand: SelectionCommand = new SelectionCommand(
            this,
            ctx,
            this.data,
            this.initialTopLeft,
            this.initialBottomRight,
            this.finalTopLeft,
        );
        rectangleSelectionCommand.execute();
    }

    finalDrawDown(ctx: CanvasRenderingContext2D): void {
        const rectangleSelectionCommand: SelectionCommand = new SelectionCommand(
            this,
            ctx,
            this.data,
            this.initialTopLeft,
            this.initialBottomRight,
            this.finalTopLeft,
        );
        rectangleSelectionCommand.execute();
        this.undoRedoService.addCommand(rectangleSelectionCommand);
    }

    drawSelectionRectangle(ctx: CanvasRenderingContext2D, finalTopLeft: Vec2, imageData: ImageData): void {
        ctx.putImageData(imageData, finalTopLeft.x, finalTopLeft.y);
    }
}
