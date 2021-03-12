import { Color } from '@app/classes/color';
import { MouseButton, Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

export abstract class SelectionTool extends Tool {
    constructor(
        drawingService: DrawingService,
        protected rectangleDrawingService: RectangleDrawingService,
        toolName: string,
        protected undoRedoService: UndoRedoService,
    ) {
        super(drawingService, toolName);
    }

    readonly boxColor: Color = { rgbValue: '#0000FF', opacity: 1 };
    movingSelection: boolean = false;
    hasSelection: boolean = false;
    private timeoutHandler: number;
    protected initialTopLeft: Vec2 = { x: 0, y: 0 };
    protected initialBottomRight: Vec2 = { x: 0, y: 0 };
    protected finalTopLeft: Vec2 = { x: 0, y: 0 };
    protected finalBottomRight: Vec2 = { x: 0, y: 0 };

    protected data: ImageData;
    protected offset: Vec2;

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (!this.mouseDown) return;
        if (this.isInsideSelection(this.getPositionFromMouse(event)) && this.hasSelection) {
            this.setOffSet(this.getPositionFromMouse(event));
            this.movingSelection = true;
            return;
        }
        this.cancelSelection();
        this.initialTopLeft = this.getPositionFromMouse(event);
        this.initialBottomRight = this.initialTopLeft;
    }

    onMouseMove(event: MouseEvent): void {
        // 1 = leftclick
        if (event.buttons !== 1) {
            this.mouseDown = false;
        }
        if (!this.mouseDown) return;

        if (this.movingSelection) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);

            this.moveSelection(this.drawingService.previewCtx, this.getPositionFromMouse(event));
            return;
        }
        this.initialBottomRight = this.getPositionFromMouse(event);
        this.adjustToBounds();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        this.drawPerimeter(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
        // this.drawBox(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.mouseDown = false;

            if (this.movingSelection) {
                this.movingSelection = false;
                return;
            }
            if (this.rectangleDrawingService.alternateShape) {
                this.initialBottomRight = this.rectangleDrawingService.getTrueEndCoords(
                    this.initialTopLeft,
                    this.getPositionFromMouse(event),
                    this.rectangleDrawingService.alternateShape,
                );
            } else {
                this.initialBottomRight = this.getPositionFromMouse(event);
            }
            this.rectangleDrawingService.alternateShape = false;
            this.adjustToBounds();

            this.drawingService.clearCanvas(this.drawingService.previewCtx);

            if (this.initialTopLeft.x !== this.initialBottomRight.x && this.initialTopLeft.y !== this.initialBottomRight.y) {
                this.saveSelection(this.drawingService.baseCtx);
                this.draw(this.drawingService.previewCtx);
                this.drawPerimeter(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
                this.drawBox(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
                this.hasSelection = true;
                this.undoRedoService.disableUndoRedo();
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        const moveDelta = 3;

        if (event.code === 'Escape') this.cancelSelection();
        if (event.code === 'ShiftLeft' && !this.hasSelection) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.rectangleDrawingService.onKeyDown(event);
            this.drawPerimeter(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
        }
        if (event.code === 'ArrowUp') this.handleArrowInitialTime(this.drawingService.previewCtx, 0, -moveDelta, event);
        if (event.code === 'ArrowDown') this.handleArrowInitialTime(this.drawingService.previewCtx, 0, moveDelta, event);
        if (event.code === 'ArrowLeft') this.handleArrowInitialTime(this.drawingService.previewCtx, -moveDelta, 0, event);
        if (event.code === 'ArrowRight') this.handleArrowInitialTime(this.drawingService.previewCtx, moveDelta, 0, event);
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.code === 'ShiftLeft' && !this.hasSelection) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.rectangleDrawingService.onKeyUp(event);
            this.drawPerimeter(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
        }

        if (this.timeoutHandler) {
            clearTimeout(this.timeoutHandler);
            this.timeoutHandler = 0;
        }
    }

    handleArrowInitialTime(ctx: CanvasRenderingContext2D, deltaX: number, deltaY: number, event: KeyboardEvent): void {
        const initialTimer = 500;
        this.moveSelectionArrow(ctx, deltaX, deltaY);
        setTimeout(() => {
            if (event.code === null) {
                this.handleArrowContinuous(ctx, deltaX, deltaY, event);
            }
        }, initialTimer);
    }

    handleArrowContinuous(ctx: CanvasRenderingContext2D, deltaX: number, deltaY: number, event: KeyboardEvent): void {
        const continuousTimer = 100;
        setTimeout(() => {
            this.moveSelectionArrow(ctx, deltaX, deltaY);
            this.timeoutHandler = 0;
        }, continuousTimer);
    }

    moveSelectionArrow(ctx: CanvasRenderingContext2D, deltaX: number, deltaY: number): void {
        this.finalTopLeft.x += deltaX;
        this.finalTopLeft.y += deltaY;
        this.finalBottomRight.x += deltaX;
        this.finalBottomRight.y += deltaY;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.draw(ctx);
        this.drawPerimeter(ctx, this.finalTopLeft, this.finalBottomRight);
        this.drawBox(ctx, this.finalTopLeft, this.finalBottomRight);
    }

    adjustToBounds(): void {
        if (this.initialBottomRight.x < 0) this.initialBottomRight.x = 0;
        if (this.initialBottomRight.x > this.drawingService.canvas.width) this.initialBottomRight.x = this.drawingService.canvas.width;

        if (this.initialBottomRight.y < 0) this.initialBottomRight.y = 0;
        if (this.initialBottomRight.y > this.drawingService.canvas.height) this.initialBottomRight.y = this.drawingService.canvas.height;
    }

    selectAll(): void {
        this.initialTopLeft = { x: 0, y: 0 };
        this.initialBottomRight = { x: this.drawingService.canvas.width, y: this.drawingService.canvas.height };
        this.saveSelection(this.drawingService.baseCtx);
        this.draw(this.drawingService.previewCtx);
        this.drawPerimeter(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
        this.drawBox(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
        this.hasSelection = true;
        this.undoRedoService.disableUndoRedo();
    }

    cancelSelection(): void {
        if (this.hasSelection) {
            this.finalDrawDown(this.drawingService.baseCtx);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.hasSelection = false;
            this.undoRedoService.enableUndoRedo();
        }
    }

    drawBox(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const trueEndCoords = this.rectangleDrawingService.getTrueEndCoords(begin, end, this.rectangleDrawingService.alternateShape);
        ctx.save();
        ctx.lineWidth = 1;
        ctx.lineJoin = 'miter';
        ctx.strokeStyle = this.boxColor.rgbValue;
        ctx.globalAlpha = this.boxColor.opacity;
        ctx.beginPath();
        ctx.rect(begin.x, begin.y, trueEndCoords.x - begin.x, trueEndCoords.y - begin.y);
        ctx.stroke();
        ctx.restore();
        this.drawControlPoints(ctx, begin, trueEndCoords);
    }

    drawControlPoints(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const pointWidth = 6;
        const halfPointWidth = pointWidth / 2;
        ctx.beginPath();
        ctx.lineWidth = 1;

        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'blue';
        ctx.rect(begin.x - halfPointWidth, begin.y - halfPointWidth, pointWidth, pointWidth);
        ctx.rect(begin.x - halfPointWidth, end.y - halfPointWidth, pointWidth, pointWidth);
        ctx.rect(end.x - halfPointWidth, begin.y - halfPointWidth, pointWidth, pointWidth);
        ctx.rect(end.x - halfPointWidth, end.y - halfPointWidth, pointWidth, pointWidth);
        ctx.rect((end.x + begin.x) / 2 - halfPointWidth, begin.y - halfPointWidth, pointWidth, pointWidth);
        ctx.rect((end.x + begin.x) / 2 - halfPointWidth, end.y - halfPointWidth, pointWidth, pointWidth);
        ctx.rect(begin.x - halfPointWidth, (begin.y + end.y) / 2 - halfPointWidth, pointWidth, pointWidth);
        ctx.rect(end.x - halfPointWidth, (begin.y + end.y) / 2 - halfPointWidth, pointWidth, pointWidth);
        ctx.stroke();
        ctx.fill();
    }

    isInsideSelection(point: Vec2): boolean {
        return (
            point.x > this.finalTopLeft.x && point.x < this.finalBottomRight.x && point.y > this.finalTopLeft.y && point.y < this.finalBottomRight.y
        );
    }

    moveSelection(ctx: CanvasRenderingContext2D, pos: Vec2): void {
        this.finalTopLeft = { x: pos.x - this.offset.x, y: pos.y - this.offset.y };
        this.finalBottomRight = {
            x: this.finalTopLeft.x + Math.abs(this.initialBottomRight.x - this.initialTopLeft.x),
            y: this.finalTopLeft.y + Math.abs(this.initialBottomRight.y - this.initialTopLeft.y),
        };

        this.draw(ctx);
        this.drawPerimeter(ctx, this.finalTopLeft, this.finalBottomRight);
        this.drawBox(ctx, this.finalTopLeft, this.finalBottomRight);
    }

    saveSelection(ctx: CanvasRenderingContext2D): void {
        this.finalTopLeft = {
            x: Math.min(this.initialTopLeft.x, this.initialBottomRight.x),
            y: Math.min(this.initialTopLeft.y, this.initialBottomRight.y),
        };
        this.finalBottomRight = {
            x: Math.max(this.initialTopLeft.x, this.initialBottomRight.x),
            y: Math.max(this.initialTopLeft.y, this.initialBottomRight.y),
        };
        this.initialTopLeft = this.finalTopLeft;
        this.initialBottomRight = this.finalBottomRight;

        this.data = ctx.getImageData(
            this.initialTopLeft.x,
            this.initialTopLeft.y,
            this.initialBottomRight.x - this.initialTopLeft.x,
            this.initialBottomRight.y - this.initialTopLeft.y,
        );

        this.fillWithWhite(ctx, this.initialTopLeft, this.initialBottomRight);
    }

    setOffSet(pos: Vec2): void {
        this.offset = { x: pos.x - this.finalTopLeft.x, y: pos.y - this.finalTopLeft.y };
    }

    abstract drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void;

    abstract draw(ctx: CanvasRenderingContext2D): void;
    abstract finalDrawDown(ctx: CanvasRenderingContext2D): void;

    abstract fillWithWhite(ctx: CanvasRenderingContext2D, topLeft: Vec2, bottomRight: Vec2): void;
}
