import { Injectable } from '@angular/core';
import { SelectionPropreties } from '@app/classes/commands/selection-command/selection-command';
import { TraceToolCommand, TraceToolPropreties } from '@app/classes/commands/trace-tool-command/trace-tool-command';
import { SelectionTool } from '@app/classes/selection-tool';
import { MouseButton } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MoveSelectionService, SelectedPoint } from '@app/services/tools/selection/move-selection.service';
import { ResizeSelectionService } from '@app/services/tools/selection/resize-selection.service';
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
        resizeSelectionService: ResizeSelectionService,
        private lineService: LineService,
    ) {
        super(
            drawingService,
            rectangleDrawingService,
            'Sélection par lasso polygonal',
            undoRedoService,
            moveSelectionService,
            resizeSelectionService,
        );
    }

    onMouseDown(event: MouseEvent): void {
        this.lineService.onMouseDown(event);
        this.mouseDown = event.button === MouseButton.Left;
        if (!this.mouseDown) return;
        if (!this.selectionExists) return;
        if (this.isInsideSelection(this.getPositionFromMouse(event))) {
            this.handleSelectionMouseDown(event);
        } else {
            this.cancelSelection();
            this.lineService.clearPath();
            this.lineService.isShiftDown = false;
        }
    }
    // tslint:disable: no-magic-numbers
    onMouseUp(event: MouseEvent): void {
        if (!this.mouseDown) return;
        this.mouseDown = false;

        if (
            this.resizeSelectionService.selectedPointIndex !== SelectedPoint.NO_POINT &&
            this.resizeSelectionService.selectedPointIndex !== SelectedPoint.CENTER
        ) {
            this.resizeSelectionService.selectedPointIndex = SelectedPoint.NO_POINT;
            return;
        }
        if (this.moveSelectionService.movingWithMouse) {
            this.moveSelectionService.movingWithMouse = false;
            return;
        }

        if (this.lineService.pathData.length !== 0) this.undoRedoService.disableUndoRedo();

        if (this.checkIfLineCrossing()) return;
        this.lineService.pathData.push(this.lineService.mousePosition);

        if (this.lineService.pathData.length > 4 && this.lineService.checkClosingLoop()) {
            this.lineService.pathData.pop();
            this.lineService.pathData.pop();
            this.lineService.pathData.push(this.lineService.pathData[0]);
            if (this.checkIfLineCrossing()) return;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.calculateInitialCoords();
            this.createSelection();
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.resizeSelectionService.previewSelectedPointIndex = this.isInsideSelection(this.getPositionFromMouse(event)) ? 9 : SelectedPoint.NO_POINT;
        this.resizeSelectionService.checkIfAControlPointHasBeenSelected(this.getPositionFromMouse(event), this.coords, true);

        // 1 = leftclick
        if (event.buttons !== 1) this.mouseDown = false;
        if (!this.mouseDown && this.selectionExists) return;

        if (
            this.resizeSelectionService.selectedPointIndex !== SelectedPoint.NO_POINT &&
            this.resizeSelectionService.selectedPointIndex !== SelectedPoint.CENTER
        ) {
            this.resizeSelectionService.resizeSelection(this.getPositionFromMouse(event), this.coords);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawAll(this.drawingService.previewCtx);
            return;
        }

        if (this.moveSelectionService.movingWithMouse) {
            this.moveSelectionService.moveSelectionWithMouse(this.drawingService.previewCtx, this.getPositionFromMouse(event), this.coords);
            this.drawAll(this.drawingService.previewCtx);
            return;
        }
        this.lineService.handleMouseMove(event);

        this.updatePerimeter();
    }

    private loadUpLinePropreties(ctx: CanvasRenderingContext2D, path: Vec2[]): TraceToolPropreties {
        return {
            drawingContext: ctx,
            drawingPath: path,
            drawingThickness: 1,
            drawingColor: { rgbValue: 'black', opacity: 1 },
            drawWithJunction: false,
            junctionDiameter: 1,
        };
    }

    protected loadUpProperties(ctx?: CanvasRenderingContext2D): SelectionPropreties {
        return {
            selectionCtx: ctx,
            selectionPathData: this.lineService.pathData,
            firstPointOffset: this.firstPointOffset,
            imageData: this.data,
            topLeft: this.coords.initialTopLeft,
            bottomRight: this.coords.initialBottomRight,
            finalTopLeft: this.coords.finalTopLeft,
            finalBottomRight: this.coords.finalBottomRight,
        };
    }

    onKeyDown(event: KeyboardEvent): void {
        if (this.selectionExists) {
            super.onKeyDown(event);
            if (event.code === 'Escape') this.lineService.clearPath();
            return;
        }

        this.lineService.onKeyDown(event);
        this.updatePerimeter();
    }

    onKeyUp(event: KeyboardEvent): void {
        if (this.selectionExists) {
            super.onKeyUp(event);
            return;
        }

        this.lineService.onKeyUp(event);
        this.updatePerimeter();
    }

    updatePerimeter(): void {
        this.calculateInitialCoords();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawPerimeter(this.drawingService.previewCtx, this.coords.initialTopLeft, this.coords.initialBottomRight);
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

        if (this.selectionExists) {
            const ratioX: number =
                (this.coords.finalBottomRight.x - this.coords.finalTopLeft.x) / (this.coords.initialBottomRight.x - this.coords.initialTopLeft.x);

            const ratioY: number =
                (this.coords.finalBottomRight.y - this.coords.finalTopLeft.y) / (this.coords.initialBottomRight.y - this.coords.initialTopLeft.y);

            ctx.translate(this.coords.finalTopLeft.x, this.coords.finalTopLeft.y);
            ctx.scale(ratioX, ratioY);
            ctx.translate(-this.coords.finalTopLeft.x, -this.coords.finalTopLeft.y);
        }
        const lineCommand: TraceToolCommand = new TraceToolCommand(this.loadUpLinePropreties(ctx, actualPoints), this.lineService);
        lineCommand.execute();
        ctx.restore();
    }
    drawSelection(selectionPropreties: SelectionPropreties): void {
        if (!selectionPropreties.selectionCtx || !selectionPropreties.selectionPathData) return;
        selectionPropreties.selectionCtx.save();
        const image: HTMLCanvasElement = document.createElement('canvas');
        image.width = selectionPropreties.bottomRight.x - selectionPropreties.topLeft.x;
        image.height = selectionPropreties.bottomRight.y - selectionPropreties.topLeft.y;
        (image.getContext('2d') as CanvasRenderingContext2D).putImageData(selectionPropreties.imageData, 0, 0);
        const ratioX: number =
            (selectionPropreties.finalBottomRight.x - selectionPropreties.finalTopLeft.x) /
            (selectionPropreties.bottomRight.x - selectionPropreties.topLeft.x);

        const ratioY: number =
            (selectionPropreties.finalBottomRight.y - selectionPropreties.finalTopLeft.y) /
            (selectionPropreties.bottomRight.y - selectionPropreties.topLeft.y);

        selectionPropreties.selectionCtx.translate(selectionPropreties.finalTopLeft.x, selectionPropreties.finalTopLeft.y);
        selectionPropreties.selectionCtx.scale(ratioX, ratioY);
        selectionPropreties.selectionCtx.translate(-selectionPropreties.finalTopLeft.x, -selectionPropreties.finalTopLeft.y);
        this.makePath(selectionPropreties, false);
        selectionPropreties.selectionCtx.clip();
        selectionPropreties.selectionCtx.drawImage(image, selectionPropreties.finalTopLeft.x, selectionPropreties.finalTopLeft.y);
        selectionPropreties.selectionCtx.restore();
    }

    fillWithWhite(selectionPropreties: SelectionPropreties): void {
        if (!selectionPropreties.selectionCtx || !selectionPropreties.selectionPathData || !selectionPropreties.firstPointOffset) return;
        selectionPropreties.selectionCtx.save();

        selectionPropreties.selectionCtx.translate(
            this.shapeService.getCenterCoords(selectionPropreties.topLeft, selectionPropreties.bottomRight).x,
            this.shapeService.getCenterCoords(selectionPropreties.topLeft, selectionPropreties.bottomRight).y,
        );
        selectionPropreties.selectionCtx.scale(0.99, 0.99);
        selectionPropreties.selectionCtx.translate(
            -this.shapeService.getCenterCoords(selectionPropreties.topLeft, selectionPropreties.bottomRight).x,
            -this.shapeService.getCenterCoords(selectionPropreties.topLeft, selectionPropreties.bottomRight).y,
        );
        selectionPropreties.selectionCtx.fillStyle = 'white';
        this.makePath(selectionPropreties, true);
        selectionPropreties.selectionCtx.fill();
        selectionPropreties.selectionCtx.restore();
    }

    makePath(selectionPropreties: SelectionPropreties, b: boolean): void {
        if (!selectionPropreties.selectionCtx || !selectionPropreties.selectionPathData || !selectionPropreties.firstPointOffset) return;
        selectionPropreties.selectionCtx.beginPath();
        for (const point of selectionPropreties.selectionPathData) {
            selectionPropreties.selectionCtx.lineTo(
                (b ? selectionPropreties.topLeft.x : selectionPropreties.finalTopLeft.x) +
                    selectionPropreties.firstPointOffset.x -
                    selectionPropreties.selectionPathData[0].x +
                    point.x,
                (b ? selectionPropreties.topLeft.y : selectionPropreties.finalTopLeft.y) +
                    selectionPropreties.firstPointOffset.y -
                    selectionPropreties.selectionPathData[0].y +
                    point.y,
            );
        }
    }

    calculateInitialCoords(): void {
        if (this.lineService.pathData.length === 0) return;
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

    checkIfLineCrossing(): boolean {
        const A1: Vec2 = this.lineService.pathData[this.lineService.pathData.length - 1];
        const A2: Vec2 = this.lineService.pathData[this.lineService.pathData.length - 2];
        let lineCrossing = false;
        // tslint:disable-next-line: cyclomatic-complexity
        this.lineService.pathData.forEach((point, index) => {
            if (index >= this.lineService.pathData.length - 3) return;

            const B1: Vec2 = point;
            const B2: Vec2 = this.lineService.pathData[index + 1];

            const deltaXA = A2.x - A1.x;
            const deltaYA = A2.y - A1.y;
            const deltaXB = B2.x - B1.x;
            const deltaYB = B2.y - B1.y;

            let intersectX =
                (B1.y * deltaXA * deltaXB - B1.x * deltaYB * deltaXA - A1.y * deltaXA * deltaXB + A1.x * deltaYA * deltaXB) /
                (deltaYA * deltaXB - deltaYB * deltaXA);

            if (deltaXA === 0) intersectX = A1.x;
            if (deltaXB === 0) intersectX = B1.x;

            let intersectY = (intersectX * deltaYA + A1.y * deltaXA - A1.x * deltaYA) / deltaXA;
            if (deltaXA === 0 || deltaXB === 0 || deltaYA === 0 || deltaYB === 0) console.log(intersectX, intersectY);

            if (deltaYA === 0) intersectY = A1.y;
            if (deltaYB === 0) intersectY = B1.y;
            if (deltaXA === 0) intersectY = (intersectX * deltaYB + B1.y * deltaXB - B1.x * deltaYB) / deltaXB;

            const upperBoundXA = Math.max(A1.x, A2.x);
            const upperBoundYA = Math.max(A1.y, A2.y);
            const upperBoundXB = Math.max(B1.x, B2.x);
            const upperBoundYB = Math.max(B1.y, B2.y);

            const lowerBoundXA = Math.min(A1.x, A2.x);
            const lowerBoundYA = Math.min(A1.y, A2.y);
            const lowerBoundXB = Math.min(B1.x, B2.x);
            const lowerBoundYB = Math.min(B1.y, B2.y);

            if (
                ((intersectX > lowerBoundXA && intersectX < upperBoundXA) || (lowerBoundXA === upperBoundXA && intersectX === upperBoundXA)) &&
                ((intersectX > lowerBoundXB && intersectX < upperBoundXB) || (lowerBoundXB === upperBoundXB && intersectX === upperBoundXB)) &&
                ((intersectY > lowerBoundYA && intersectY < upperBoundYA) || (lowerBoundYA === upperBoundYA && intersectY === upperBoundYA)) &&
                ((intersectY > lowerBoundYB && intersectY < upperBoundYB) || (lowerBoundYB === upperBoundYB && intersectY === upperBoundYB))
            )
                lineCrossing = true;
        });
        return lineCrossing;
    }
}
