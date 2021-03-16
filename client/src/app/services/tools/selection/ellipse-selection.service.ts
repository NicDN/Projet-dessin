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
export class EllipseSelectionService extends SelectionTool {
    constructor(drawingService: DrawingService, rectangleDrawingService: RectangleDrawingService, undoRedoService: UndoRedoService) {
        super(drawingService, rectangleDrawingService, 'Sélection par ellipse', undoRedoService);
    }

    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const trueEndCoords = this.rectangleDrawingService.getTrueEndCoords(begin, end, this.rectangleDrawingService.alternateShape);
        this.rectangleDrawingService.drawEllipticalPerimeter(ctx, begin, trueEndCoords);
    }

    fillWithWhite(ctx: CanvasRenderingContext2D, topLeft: Vec2, bottomRight: Vec2): void {
        const centerCoords: Vec2 = this.rectangleDrawingService.getCenterCoords(topLeft, bottomRight);

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(centerCoords.x, centerCoords.y, (bottomRight.x - topLeft.x) / 2, (bottomRight.y - topLeft.y) / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const ellipseSelectionCommand: SelectionCommand = new SelectionCommand(
            this,
            ctx,
            this.data,
            this.initialTopLeft,
            this.initialBottomRight,
            this.finalTopLeft,
            this.finalBottomRight,
        );
        ellipseSelectionCommand.execute();
    }

    drawSelectionEllipse(ctx: CanvasRenderingContext2D, imageData: ImageData, finalBottomRight: Vec2, finalTopLeft: Vec2): void {
        ctx.save();
        const image: HTMLCanvasElement = document.createElement('canvas');
        image.width = finalBottomRight.x - finalTopLeft.x;
        image.height = finalBottomRight.y - finalTopLeft.y;
        (image.getContext('2d') as CanvasRenderingContext2D).putImageData(imageData, 0, 0);
        const centerCoords: Vec2 = this.rectangleDrawingService.getCenterCoords(finalTopLeft, finalBottomRight);

        ctx.beginPath();
        ctx.ellipse(
            centerCoords.x,
            centerCoords.y,
            (finalBottomRight.x - finalTopLeft.x) / 2,
            (finalBottomRight.y - finalTopLeft.y) / 2,
            0,
            0,
            2 * Math.PI,
        );
        ctx.clip();
        ctx.drawImage(image, finalTopLeft.x, finalTopLeft.y);
        ctx.restore();
    }

    finalDrawDown(ctx: CanvasRenderingContext2D): void {
        const ellipseSelectionCommand: SelectionCommand = new SelectionCommand(
            this,
            ctx,
            this.data,
            this.initialTopLeft,
            this.initialBottomRight,
            this.finalTopLeft,
            this.finalBottomRight,
        );
        ellipseSelectionCommand.execute();
        this.undoRedoService.addCommand(ellipseSelectionCommand);
    }
}
