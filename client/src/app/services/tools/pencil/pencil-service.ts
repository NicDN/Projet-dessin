import { Injectable } from '@angular/core';
import { DrawingCommand } from '@app/classes/commands/drawing-command';
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
    constructor(drawingService: DrawingService, colorService: ColorService, private undoRedoService: UndoRedoService) {
        super(drawingService, colorService, 'Crayon');
        this.mouseDownCoord = { x: 0, y: 0 };
        this.clearPath();
        this.isEraser = false;
    }

    private pathData: Vec2[];

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

    sendCommandAction(): void {
        const drawingCommand: DrawingCommand = new DrawingCommand(
            this.drawingService.baseCtx,
            this.pathData,
            this.thickness,
            this.colorService.mainColor.rgbValue,
            this.colorService.mainColor.opacity,
        );
        drawingCommand.execute();
        this.undoRedoService.addCommand(drawingCommand);
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

    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        // 1 Instancie pencilCmd
        // 2 pencilCmd.execute().
        // 3. undoRedoService.push(pencilCmd);

        const drawingCommand: DrawingCommand = new DrawingCommand(
            ctx,
            path,
            this.thickness,
            this.colorService.mainColor.rgbValue,
            this.colorService.mainColor.opacity,
        );
        drawingCommand.execute();
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
