import { Injectable } from '@angular/core';
import { TraceToolCommand, TraceToolPropreties } from '@app/classes/commands/trace-tool-command/trace-tool-command';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/drawing-tool/pencil/pencil.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class EraserService extends PencilService {
    readonly MIN_THICKNESS: number = 5;

    constructor(drawingService: DrawingService, colorService: ColorService, undoRedoService: UndoRedoService) {
        super(drawingService, colorService, undoRedoService);
        this.thickness = this.MIN_THICKNESS;
        this.minThickness = this.MIN_THICKNESS;
        this.toolName = 'Efface';
        this.isEraser = true;
    }

    sendCommandAction(): void {
        const eraserCommand: TraceToolCommand = new TraceToolCommand(this.loadUpEraserPropreties(this.drawingService.baseCtx, this.pathData), this);
        eraserCommand.execute();
        this.undoRedoService.addCommand(eraserCommand);
    }

    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        const eraserCommand: TraceToolCommand = new TraceToolCommand(this.loadUpEraserPropreties(this.drawingService.baseCtx, this.pathData), this);
        eraserCommand.execute();
    }

    drawTrace(drawingToolPropreties: TraceToolPropreties): void {
        if (this.singleClick(drawingToolPropreties.drawingPath)) {
            this.eraseSquare(
                drawingToolPropreties.drawingContext,
                { x: drawingToolPropreties.drawingPath[0].x, y: drawingToolPropreties.drawingPath[0].y },
                drawingToolPropreties.drawingThickness,
            );
            return;
        }

        let oldPointX: number = drawingToolPropreties.drawingPath[0].x;
        let oldPointY: number = drawingToolPropreties.drawingPath[0].y;

        for (const point of drawingToolPropreties.drawingPath) {
            const dist = this.distanceBetween({ x: oldPointX, y: oldPointY }, { x: point.x, y: point.y });

            const angle = this.angleBetween({ x: oldPointX, y: oldPointY }, { x: point.x, y: point.y });

            for (let i = 0; i < dist; i += 1) {
                const xValue = oldPointX + Math.sin(angle) * i;
                const yValue = oldPointY + Math.cos(angle) * i;
                this.eraseSquare(drawingToolPropreties.drawingContext, { x: xValue, y: yValue }, drawingToolPropreties.drawingThickness);
            }
            oldPointX = point.x;
            oldPointY = point.y;
        }
    }

    private loadUpEraserPropreties(ctx: CanvasRenderingContext2D, path: Vec2[]): TraceToolPropreties {
        return {
            drawingContext: ctx,
            drawingPath: path,
            drawingThickness: this.thickness,
        };
    }

    private distanceBetween(point1: Vec2, point2: Vec2): number {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }

    private angleBetween(point1: Vec2, point2: Vec2): number {
        return Math.atan2(point2.x - point1.x, point2.y - point1.y);
    }

    private singleClick(path: Vec2[]): boolean {
        return path.length === 2;
    }

    private eraseSquare(ctx: CanvasRenderingContext2D, point: Vec2, thickness: number): void {
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

    private displayPreview(event: MouseEvent): void {
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

    private setAttributesDisplay(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 1;
    }
}
