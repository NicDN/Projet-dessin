import { Injectable } from '@angular/core';
import { PencilCommand, PencilPropreties } from '@app/classes/commands/pencil-command';
import { MouseButton } from '@app/classes/tool';
import { TraceTool } from '@app/classes/trace-tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
@Injectable({
    providedIn: 'root',
})
export class PencilService extends TraceTool {
    isEraser: boolean;
    constructor(drawingService: DrawingService, colorService: ColorService, protected undoRedoService: UndoRedoService) {
        super(drawingService, colorService, 'Crayon');
        this.mouseDownCoord = { x: 0, y: 0 };
        this.clearPath();
        this.isEraser = false;
    }

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
        const drawingCommand: PencilCommand = new PencilCommand(this.loadUpPropreties(this.drawingService.baseCtx, this.pathData));
        drawingCommand.execute();
        this.undoRedoService.addCommand(drawingCommand);
    }

    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        const drawingCommand: PencilCommand = new PencilCommand(this.loadUpPropreties(ctx, path));
        drawingCommand.execute();
    }

    loadUpPropreties(ctx: CanvasRenderingContext2D, path: Vec2[]): PencilPropreties {
        return {
            drawingContext: ctx,
            drawingPath: path,
            drawingThickness: this.thickness,
            drawingColor: { rgbValue: this.colorService.mainColor.rgbValue, opacity: this.colorService.mainColor.opacity },
        };
    }

    private clearPath(): void {
        this.pathData = [];
    }

    onMouseOut(event: MouseEvent): void {
        this.onMouseUp(event);
    }

    onMouseEnter(event: MouseEvent): void {
        // event.buttons is 1 when left click is pressed.
        if (event.buttons === 1) {
            this.mouseDown = true;
        }
    }
}
