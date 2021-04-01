import { Injectable } from '@angular/core';
import { SelectionPropreties } from '@app/classes/commands/selection-command/selection-command';
import { TraceToolCommand, TraceToolPropreties } from '@app/classes/commands/trace-tool-command/trace-tool-command';
import { SelectionTool } from '@app/classes/selection-tool';
import { MouseButton } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MoveSelectionService } from '@app/services/tools/selection/move-selection.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { LineService } from '@app/services/tools/trace-tool/line/line.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
@Injectable({
    providedIn: 'root',
})
export class LassoSelectionService extends SelectionTool {
    firstPointOffset: Vec2;
    constructor(
        drawingService: DrawingService,
        rectangleDrawingService: RectangleDrawingService,
        undoRedoService: UndoRedoService,
        moveSelectionService: MoveSelectionService,
        private lineService: LineService,
    ) {
        super(drawingService, rectangleDrawingService, 'Sélection par lasso polygonal', undoRedoService, moveSelectionService);
    }

    onMouseDown(event: MouseEvent): void {
        this.lineService.onMouseDown(event);

        this.mouseDown = event.button === MouseButton.Left;
        if (!this.mouseDown) return;
        if (this.isInsideSelection(this.getPositionFromMouse(event)) && this.selectionExists) {
            this.setOffSet(this.getPositionFromMouse(event));
            this.moveSelectionService.movingWithMouse = true;
            return;
        } else if (this.selectionExists) {
            this.undoRedoService.disableUndoRedo();
            this.cancelSelection();
            this.lineService.clearPath();
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.mouseDown) return;
        this.mouseDown = false;

        if (this.moveSelectionService.movingWithMouse) {
            this.moveSelectionService.movingWithMouse = false;
            return;
        }

        this.lineService.pathData.push(this.lineService.mousePosition);

        if (this.lineService.pathData.length > 2) {
            const MAX_OFFSET = 20;
            const firstPos = this.lineService.pathData[0];
            const dx = Math.abs(firstPos.x - this.lineService.mousePosition.x);
            const dy = Math.abs(firstPos.y - this.lineService.mousePosition.y);

            if (dx <= MAX_OFFSET && dy <= MAX_OFFSET) {
                this.lineService.pathData.pop();
                this.lineService.pathData.pop();
                this.lineService.pathData.push(this.lineService.pathData[0]);

                this.calculateInitialCoords();
                this.createSelection();
            }
        }
    }

    onMouseMove(event: MouseEvent): void {
        // 1 = leftclick
        if (event.buttons !== 1) this.mouseDown = false;
        if (!this.mouseDown && this.selectionExists) return;

        if (this.moveSelectionService.movingWithMouse) {
            this.moveSelectionService.moveSelectionWithMouse(this.drawingService.previewCtx, this.getPositionFromMouse(event), this.coords);
            this.drawAll(this.drawingService.previewCtx);
            return;
        }

        this.lineService.mousePosition = this.getPositionFromMouse(event);
        this.lineService.pathData.pop();
        this.lineService.pathData.push(this.lineService.mousePosition);

        if (this.lineService.isShiftDown) {
            this.lineService.lockLine();
        } else {
            this.calculateInitialCoords();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawPerimeter(this.drawingService.previewCtx, this.coords.initialTopLeft, this.coords.initialBottomRight);
        }
    }

    private loadUpPropreties(ctx: CanvasRenderingContext2D, path: Vec2[]): TraceToolPropreties {
        return {
            drawingContext: ctx,
            drawingPath: path,
            drawingThickness: 1,
            drawingColor: { rgbValue: 'black', opacity: 1 },
            drawWithJunction: false,
            junctionDiameter: 1,
        };
    }

    onKeyDown(event: KeyboardEvent): void {
        super.onKeyDown(event);
        this.lineService.onKeyDown(event);
    }

    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        ctx.save();
        ctx.setLineDash([this.shapeService.DASH_SIZE * 2, this.shapeService.DASH_SIZE]);
        const actualPoints = this.lineService.pathData.map((point) => {
            return {
                x: begin.x + this.firstPointOffset.x - this.lineService.pathData[0].x + point.x,
                y: begin.y + this.firstPointOffset.y - this.lineService.pathData[0].y + point.y,
            };
        });
        const lineCommand: TraceToolCommand = new TraceToolCommand(this.loadUpPropreties(ctx, actualPoints), this.lineService);
        lineCommand.execute();
        ctx.restore();
    }
    drawSelection(selectionPropreties: SelectionPropreties): void {
        if (!selectionPropreties.selectionCtx) return;
        selectionPropreties.selectionCtx.save();
        const image: HTMLCanvasElement = document.createElement('canvas');
        image.width = selectionPropreties.finalBottomRight.x - selectionPropreties.finalTopLeft.x;
        image.height = selectionPropreties.finalBottomRight.y - selectionPropreties.finalTopLeft.y;
        (image.getContext('2d') as CanvasRenderingContext2D).putImageData(selectionPropreties.imageData, 0, 0);

        selectionPropreties.selectionCtx.beginPath();
        for (const point of this.lineService.pathData) {
            selectionPropreties.selectionCtx.lineTo(
                selectionPropreties.finalTopLeft.x + this.firstPointOffset.x - this.lineService.pathData[0].x + point.x,
                selectionPropreties.finalTopLeft.y + this.firstPointOffset.y - this.lineService.pathData[0].y + point.y,
            );
        }
        selectionPropreties.selectionCtx.clip();
        selectionPropreties.selectionCtx.drawImage(image, selectionPropreties.finalTopLeft.x, selectionPropreties.finalTopLeft.y);
        selectionPropreties.selectionCtx.restore();
    }
    fillWithWhite(selectionPropreties: SelectionPropreties): void {
        if (!selectionPropreties.selectionCtx) return;
        selectionPropreties.selectionCtx.fillStyle = 'white';
        selectionPropreties.selectionCtx.beginPath();
        for (const point of this.lineService.pathData) {
            selectionPropreties.selectionCtx.lineTo(
                selectionPropreties.finalTopLeft.x + this.firstPointOffset.x - this.lineService.pathData[0].x + point.x,
                selectionPropreties.finalTopLeft.y + this.firstPointOffset.y - this.lineService.pathData[0].y + point.y,
            );
        }
        selectionPropreties.selectionCtx.fill();
    }

    calculateInitialCoords(): void {
        this.coords.initialTopLeft = {
            x: Math.min(...this.lineService.pathData.map((data) => data.x)),
            y: Math.min(...this.lineService.pathData.map((data) => data.y)),
        };

        this.coords.initialBottomRight = {
            x: Math.max(...this.lineService.pathData.map((data) => data.x)),
            y: Math.max(...this.lineService.pathData.map((data) => data.y)),
        };
        this.firstPointOffset = {
            x: this.lineService.pathData[0].x - this.coords.initialTopLeft.x,
            y: this.lineService.pathData[0].y - this.coords.initialTopLeft.y,
        };
    }
}
