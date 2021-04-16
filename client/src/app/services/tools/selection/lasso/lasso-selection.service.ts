import { Injectable } from '@angular/core';
import { SelectionProperties } from '@app/classes/commands/selection-command/selection-command';
import { TraceToolCommand, TraceToolPropreties } from '@app/classes/commands/trace-tool-command/trace-tool-command';
import { SelectionTool } from '@app/classes/selection-tool';
import { MouseButton } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetSelectionService, SelectedPoint } from '@app/services/tools/selection/magnet-selection.service';
import { MoveSelectionService } from '@app/services/tools/selection/move-selection.service';
import { ResizeSelectionService } from '@app/services/tools/selection/resize-selection.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { LineService } from '@app/services/tools/trace-tool/line/line.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
@Injectable({
    providedIn: 'root',
})
export class LassoSelectionService extends SelectionTool {
    readonly minPointsForClosingLoop: number = 4;
    firstPointOffset: Vec2;
    constructor(
        drawingService: DrawingService,
        rectangleDrawingService: RectangleDrawingService,
        undoRedoService: UndoRedoService,
        moveSelectionService: MoveSelectionService,
        resizeSelectionService: ResizeSelectionService,
        private lineService: LineService,
        magnetSelectionService: MagnetSelectionService,
    ) {
        super(
            drawingService,
            rectangleDrawingService,
            'Sélection par lasso polygonal',
            undoRedoService,
            moveSelectionService,
            resizeSelectionService,
            magnetSelectionService,
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

    onMouseMove(event: MouseEvent): void {
        this.updateResizeProperties(this.getPositionFromMouse(event));

        // 1 = leftclick
        if (event.buttons !== 1) this.mouseDown = false;
        if (!this.mouseDown && this.selectionExists) return;

        if (
            this.resizeSelectionService.selectedPointIndex !== SelectedPoint.NO_POINT &&
            this.resizeSelectionService.selectedPointIndex !== SelectedPoint.CENTER
        ) {
            this.resizeSelection(this.getPositionFromMouse(event));
            return;
        }

        if (this.moveSelectionService.movingWithMouse) {
            this.moveSelectionService.moveSelectionWithMouse(this.getPositionFromMouse(event), this.coords);
            this.drawAll(this.drawingService.previewCtx);
            return;
        }
        this.lineService.handleMouseMove(event);

        this.updatePerimeter();
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.mouseDown) return;
        this.mouseDown = false;

        if (this.resizeSelectionService.selectedPointIndex !== SelectedPoint.NO_POINT) {
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

        if (this.lineService.pathData.length > this.minPointsForClosingLoop && this.lineService.checkClosingLoop()) {
            this.closeLoop();
        }
    }

    private closeLoop(): void {
        this.lineService.pathData.pop();
        this.lineService.pathData.pop();
        this.lineService.pathData.push(this.lineService.pathData[0]);
        // need to check crossing condition again after looping back to beginning
        if (this.checkIfLineCrossing()) return;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.calculateInitialCoords();
        this.createSelection();
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

    protected loadUpProperties(ctx?: CanvasRenderingContext2D): SelectionProperties {
        return {
            selectionCtx: ctx,
            selectionPathData: this.lineService.pathData,
            firstPointOffset: this.firstPointOffset,
            imageData: this.data,
            coords: this.coords,
        };
    }

    private updatePerimeter(): void {
        this.calculateInitialCoords();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawPerimeter(this.drawingService.previewCtx, this.coords.initialTopLeft, this.coords.initialBottomRight);
    }

    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        ctx.save();
        ctx.setLineDash([this.shapeService.DASH_SIZE * 2, this.shapeService.DASH_SIZE]);
        const actualPoints = this.lineService.pathData.map((point) => ({
            x: begin.x + this.firstPointOffset.x - this.lineService.pathData[0].x + point.x,
            y: begin.y + this.firstPointOffset.y - this.lineService.pathData[0].y + point.y,
        }));

        if (this.selectionExists) this.scaleContext(this.coords, ctx);

        const lineCommand: TraceToolCommand = new TraceToolCommand(this.loadUpLinePropreties(ctx, actualPoints), this.lineService);
        lineCommand.execute();
        ctx.restore();
    }

    drawSelection(selectionPropreties: SelectionProperties): void {
        if (!selectionPropreties.selectionCtx || !selectionPropreties.selectionPathData) return;
        selectionPropreties.selectionCtx.save();
        const image: HTMLCanvasElement = document.createElement('canvas');
        image.width = selectionPropreties.coords.initialBottomRight.x - selectionPropreties.coords.initialTopLeft.x;
        image.height = selectionPropreties.coords.initialBottomRight.y - selectionPropreties.coords.initialTopLeft.y;
        (image.getContext('2d') as CanvasRenderingContext2D).putImageData(selectionPropreties.imageData, 0, 0);

        this.scaleContext(selectionPropreties.coords, selectionPropreties.selectionCtx);
        this.makePath(selectionPropreties, selectionPropreties.coords.finalTopLeft);
        selectionPropreties.selectionCtx.clip();
        selectionPropreties.selectionCtx.drawImage(image, selectionPropreties.coords.finalTopLeft.x, selectionPropreties.coords.finalTopLeft.y);
        selectionPropreties.selectionCtx.restore();
    }

    fillWithWhite(selectionPropreties: SelectionProperties): void {
        if (!selectionPropreties.selectionCtx || !selectionPropreties.selectionPathData || !selectionPropreties.firstPointOffset) return;
        selectionPropreties.selectionCtx.save();

        selectionPropreties.selectionCtx.fillStyle = 'white';
        this.makePath(selectionPropreties, selectionPropreties.coords.initialTopLeft);
        selectionPropreties.selectionCtx.fill();
        selectionPropreties.selectionCtx.restore();
    }

    private makePath(selectionPropreties: SelectionProperties, pos: Vec2): void {
        if (!selectionPropreties.selectionCtx || !selectionPropreties.selectionPathData || !selectionPropreties.firstPointOffset) return;
        selectionPropreties.selectionCtx.beginPath();
        for (const point of selectionPropreties.selectionPathData) {
            selectionPropreties.selectionCtx.lineTo(
                pos.x + selectionPropreties.firstPointOffset.x - selectionPropreties.selectionPathData[0].x + point.x,
                pos.y + selectionPropreties.firstPointOffset.y - selectionPropreties.selectionPathData[0].y + point.y,
            );
        }
    }

    private calculateInitialCoords(): void {
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
        const a1: Vec2 = this.lineService.pathData[this.lineService.pathData.length - 1];
        const a2: Vec2 = this.lineService.pathData[this.lineService.pathData.length - 2];
        if (a1 === a2) return false;
        let lineCrossing = false;
        this.lineService.pathData.forEach((point, index) => {
            if (index >= this.lineService.pathData.length - 3 || lineCrossing) return;

            const b1: Vec2 = point;
            const b2: Vec2 = this.lineService.pathData[index + 1];

            const intersect: Vec2 = this.calculateIntersectPoint(a1, a2, b1, b2);

            if (this.intersectInBounds(a1, a2, b1, b2, intersect)) lineCrossing = true;
        });
        return lineCrossing;
    }

    private calculateIntersectPoint(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2): Vec2 {
        const deltaXA = a2.x - a1.x;
        const deltaYA = a2.y - a1.y;
        const deltaXB = b2.x - b1.x;
        const deltaYB = b2.y - b1.y;

        let intersectX =
            (b1.y * deltaXA * deltaXB - b1.x * deltaYB * deltaXA - a1.y * deltaXA * deltaXB + a1.x * deltaYA * deltaXB) /
            (deltaYA * deltaXB - deltaYB * deltaXA);

        if (deltaXA === 0) intersectX = a1.x;
        if (deltaXB === 0) intersectX = b1.x;

        let intersectY = (intersectX * deltaYA + a1.y * deltaXA - a1.x * deltaYA) / deltaXA;

        if (deltaYA === 0) intersectY = a1.y;
        if (deltaYB === 0) intersectY = b1.y;
        if (deltaXA === 0) intersectY = (intersectX * deltaYB + b1.y * deltaXB - b1.x * deltaYB) / deltaXB;
        return { x: intersectX, y: intersectY };
    }

    private intersectInBounds(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2, intersect: Vec2): boolean {
        const upperBoundXA = Math.max(a1.x, a2.x);
        const upperBoundYA = Math.max(a1.y, a2.y);
        const upperBoundXB = Math.max(b1.x, b2.x);
        const upperBoundYB = Math.max(b1.y, b2.y);

        const lowerBoundXA = Math.min(a1.x, a2.x);
        const lowerBoundYA = Math.min(a1.y, a2.y);
        const lowerBoundXB = Math.min(b1.x, b2.x);
        const lowerBoundYB = Math.min(b1.y, b2.y);

        return (
            ((intersect.x > lowerBoundXA && intersect.x < upperBoundXA) || lowerBoundXA === upperBoundXA) &&
            ((intersect.x > lowerBoundXB && intersect.x < upperBoundXB) || lowerBoundXB === upperBoundXB) &&
            ((intersect.y > lowerBoundYA && intersect.y < upperBoundYA) || lowerBoundYA === upperBoundYA) &&
            ((intersect.y > lowerBoundYB && intersect.y < upperBoundYB) || lowerBoundYB === upperBoundYB)
        );
    }
}
