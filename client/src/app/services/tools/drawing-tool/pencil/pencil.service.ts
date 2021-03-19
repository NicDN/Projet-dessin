import { Injectable } from '@angular/core';
import { TraceToolCommand, TraceToolPropreties, TraceToolType } from '@app/classes/commands/drawing-tool-command/drawing-tool-command';
import { MouseButton } from '@app/classes/tool';
import { TraceTool } from '@app/classes/trace-tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PencilService extends TraceTool {
    constructor(drawingService: DrawingService, colorService: ColorService, protected undoRedoService: UndoRedoService) {
        super(drawingService, colorService, 'Crayon');
        this.mouseDownCoord = { x: 0, y: 0 };
        this.clearPath();
        this.isEraser = false;
    }
    isEraser: boolean;
    subscription: Subscription;

    protected pathData: Vec2[];

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);

            this.sendCommandAction();

            this.clearPreviewIfNotEraser(this.isEraser);
        }
        this.mouseDown = false;
        this.clearPath();
    }

    clearPreviewIfNotEraser(isEraser: boolean): void {
        if (!isEraser) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        }
    }

    everyMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.previewCtx, this.pathData);
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.everyMouseMove(event);
    }

    sendCommandAction(): void {
        if (this.isEraser) return;
        const drawingCommand: TraceToolCommand = new TraceToolCommand(this.loadUpPropreties(this.drawingService.baseCtx, this.pathData), this);
        drawingCommand.execute();
        this.undoRedoService.addCommand(drawingCommand);
    }

    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        const drawingCommand: TraceToolCommand = new TraceToolCommand(this.loadUpPropreties(ctx, path), this);
        drawingCommand.execute();
    }

    drawTrace(drawingToolPropreties: TraceToolPropreties): void {
        this.setContext(drawingToolPropreties.drawingContext, drawingToolPropreties);
        drawingToolPropreties.drawingContext.save();
        let oldPointX: number = drawingToolPropreties.drawingPath[0].x;
        let oldPointY: number = drawingToolPropreties.drawingPath[0].y;

        drawingToolPropreties.drawingContext.beginPath();
        for (const point of drawingToolPropreties.drawingPath) {
            drawingToolPropreties.drawingContext.moveTo(oldPointX, oldPointY);
            drawingToolPropreties.drawingContext.lineTo(point.x, point.y);

            oldPointX = point.x;
            oldPointY = point.y;
        }
        drawingToolPropreties.drawingContext.stroke();
        drawingToolPropreties.drawingContext.restore();
    }

    private setContext(ctx: CanvasRenderingContext2D, drawingToolPropreties: TraceToolPropreties): void {
        if (drawingToolPropreties.drawingColor === undefined) return;
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.lineWidth = drawingToolPropreties.drawingThickness;
        ctx.globalAlpha = drawingToolPropreties.drawingColor.opacity;
        ctx.strokeStyle = drawingToolPropreties.drawingColor.rgbValue;
    }

    loadUpPropreties(ctx: CanvasRenderingContext2D, path: Vec2[]): TraceToolPropreties {
        return {
            traceToolType: TraceToolType.Pencil,
            drawingContext: ctx,
            drawingPath: path,
            drawingThickness: this.thickness,
            drawingColor: { rgbValue: this.colorService.mainColor.rgbValue, opacity: this.colorService.mainColor.opacity },
        };
    }

    private clearPath(): void {
        this.pathData = [];
    }

    onMouseEnter(event: MouseEvent): void {
        // event.buttons is 1 when left click is pressed.
        if (event.buttons === 1) {
            this.mouseDown = true;
        }
    }
}
