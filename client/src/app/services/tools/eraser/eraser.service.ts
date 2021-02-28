import { Injectable } from '@angular/core';
import { EraserCommand } from '@app/classes/commands/erasing-command';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class EraserService extends PencilService {
    readonly MINTHICKNESS: number = 5;

    constructor(drawingService: DrawingService, colorService: ColorService, undoRedoService: UndoRedoService) {
        super(drawingService, colorService, undoRedoService);
        this.thickness = this.MINTHICKNESS;
        this.minThickness = this.MINTHICKNESS;
        this.toolName = 'Efface';
        this.isEraser = true;
    }
    sendCommandAction(): void {
        const erraserCommand: EraserCommand = new EraserCommand(this.drawingService.baseCtx, this.pathData, this.thickness, this);
        erraserCommand.execute();
        this.undoRedoService.addCommand(erraserCommand);
    }

    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        const erraserCommand: EraserCommand = new EraserCommand(this.drawingService.baseCtx, path, this.thickness, this);
        erraserCommand.execute();
    }

    distanceBetween(point1: Vec2, point2: Vec2): number {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }

    angleBetween(point1: Vec2, point2: Vec2): number {
        return Math.atan2(point2.x - point1.x, point2.y - point1.y);
    }

    verifThickness(ctx: CanvasRenderingContext2D, thickness: number): void {
        if (thickness < this.MINTHICKNESS) thickness = this.MINTHICKNESS;
        ctx.lineWidth = thickness;
    }

    singleClick(path: Vec2[]): boolean {
        return path.length === 2;
    }

    eraseSquare(ctx: CanvasRenderingContext2D, point: Vec2): void {
        ctx.clearRect(point.x - Math.floor(this.thickness / 2), point.y - Math.floor(this.thickness / 2), this.thickness, this.thickness);

        // If we want to draw in white:
        // ctx.fillStyle = 'white';
        // ctx.fillRect(point.x - Math.floor(this.thickness / 2), point.y - Math.floor(this.thickness / 2), this.thickness, this.thickness);
    }

    onMouseMove(event: MouseEvent): void {
        this.everyMouseMove(event);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.displayPreview(event);
    }

    displayPreview(event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        const ctx = this.drawingService.previewCtx;
        this.setAttributesDisplay(ctx);

        ctx.beginPath();
        ctx.rect(
            mousePosition.x - Math.floor(this.thickness / 2) + 1,
            mousePosition.y - Math.floor(this.thickness / 2) + 1,
            this.thickness - 2,
            this.thickness - 2,
        );
        ctx.fill();
        ctx.beginPath();
        ctx.rect(mousePosition.x - Math.floor(this.thickness / 2), mousePosition.y - Math.floor(this.thickness / 2), this.thickness, this.thickness);
        ctx.stroke();
    }

    setAttributesDisplay(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 1;
    }
}
