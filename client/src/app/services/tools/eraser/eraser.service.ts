import { Injectable } from '@angular/core';
import { EraserCommand, EraserPropreties } from '@app/classes/commands/erasing-command/erasing-command';
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
        const erraserCommand: EraserCommand = new EraserCommand(this, this.loadUpEraserPropreties(this.drawingService.baseCtx, this.pathData));
        erraserCommand.execute();
        this.undoRedoService.addCommand(erraserCommand);
    }

    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        const erraserCommand: EraserCommand = new EraserCommand(this, this.loadUpEraserPropreties(this.drawingService.baseCtx, this.pathData));
        erraserCommand.execute();
    }

    executeErase(eraserPropreties: EraserPropreties): void {
        if (this.singleClick(eraserPropreties.drawingPath)) {
            this.eraseSquare(
                eraserPropreties.drawingContext,
                { x: eraserPropreties.drawingPath[0].x, y: eraserPropreties.drawingPath[0].y },
                eraserPropreties.drawingThickness,
            );
            return;
        }

        let oldPointX: number = eraserPropreties.drawingPath[0].x;
        let oldPointY: number = eraserPropreties.drawingPath[0].y;

        for (const point of eraserPropreties.drawingPath) {
            const dist = this.distanceBetween({ x: oldPointX, y: oldPointY }, { x: point.x, y: point.y });

            const angle = this.angleBetween({ x: oldPointX, y: oldPointY }, { x: point.x, y: point.y });

            for (let i = 0; i < dist; i += 1) {
                const xValue = oldPointX + Math.sin(angle) * i;
                const yValue = oldPointY + Math.cos(angle) * i;
                this.eraseSquare(eraserPropreties.drawingContext, { x: xValue, y: yValue }, eraserPropreties.drawingThickness);
            }
            oldPointX = point.x;
            oldPointY = point.y;
        }
    }

    loadUpEraserPropreties(ctx: CanvasRenderingContext2D, path: Vec2[]): EraserPropreties {
        return {
            drawingContext: ctx,
            drawingPath: path,
            drawingThickness: this.thickness,
        };
    }

    distanceBetween(point1: Vec2, point2: Vec2): number {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }

    angleBetween(point1: Vec2, point2: Vec2): number {
        return Math.atan2(point2.x - point1.x, point2.y - point1.y);
    }

    singleClick(path: Vec2[]): boolean {
        return path.length === 2;
    }

    eraseSquare(ctx: CanvasRenderingContext2D, point: Vec2, thickness: number): void {
        // ctx.clearRect(point.x - Math.floor(this.thickness / 2), point.y - Math.floor(this.thickness / 2), this.thickness, this.thickness);
        // If we want to draw in white:
        ctx.fillStyle = 'white';
        ctx.globalAlpha = 1;
        ctx.fillRect(point.x - Math.floor(thickness / 2), point.y - Math.floor(thickness / 2), thickness, thickness);
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
