import { Color } from '@app/classes/color';
import { SelectionPropreties, SelectionType } from '@app/classes/commands/selection-command/selection-command';
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

    readonly moveDelta: number = 3;
    movingWithArrows: boolean = false;
    keyUpIsDown: boolean = false;
    keyDownIsDown: boolean = false;
    keyLeftIsDown: boolean = false;
    keyRightIsDown: boolean = false;

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
        if (event.code === 'Escape') this.cancelSelection();
        if (event.code === 'ShiftLeft' && !this.hasSelection) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.rectangleDrawingService.onKeyDown(event);
            this.drawPerimeter(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
        }

        this.handleMovingArrows(event);
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.code === 'ShiftLeft' && !this.hasSelection) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.rectangleDrawingService.onKeyUp(event);
            this.drawPerimeter(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
        }

        this.updateArrowKeysNotPressed(event);

        if (this.timeoutHandler) {
            clearTimeout(this.timeoutHandler);
            this.timeoutHandler = 0;
        }
    }

    handleMovingArrows(event: KeyboardEvent): void {
        this.updateArrowKeysPressed(event);
        if (this.checkIfAnyArrowIsPressed()) this.handleArrowInitialTime(this.drawingService.previewCtx, 0, -this.moveDelta, event);
    }

    handleArrowInitialTime(ctx: CanvasRenderingContext2D, deltaX: number, deltaY: number, event: KeyboardEvent): void {
        const initialTimer = 100;
        deltaY = 0;
        deltaX = 0;
        if (this.keyUpIsDown) deltaY -= this.moveDelta;
        if (this.keyDownIsDown) deltaY += this.moveDelta;
        if (this.keyLeftIsDown) deltaX -= this.moveDelta;
        if (this.keyRightIsDown) deltaX += this.moveDelta;

        this.moveSelectionArrow(ctx, deltaX, deltaY);
        setTimeout(() => {
            if (event.code !== null) {
                this.moveSelectionArrow(ctx, deltaX, deltaY);
            }
        }, initialTimer);
    }

    checkIfAnyArrowIsPressed(): boolean {
        return this.keyUpIsDown || this.keyDownIsDown || this.keyLeftIsDown || this.keyRightIsDown;
    }

    updateArrowKeysPressed(event: KeyboardEvent): void {
        if (event.code === 'ArrowUp') this.keyUpIsDown = true;
        if (event.code === 'ArrowDown') this.keyDownIsDown = true;
        if (event.code === 'ArrowLeft') this.keyLeftIsDown = true;
        if (event.code === 'ArrowRight') this.keyRightIsDown = true;
    }
    updateArrowKeysNotPressed(event: KeyboardEvent): void {
        if (event.code === 'ArrowUp') this.keyUpIsDown = false;
        if (event.code === 'ArrowDown') this.keyDownIsDown = false;
        if (event.code === 'ArrowLeft') this.keyLeftIsDown = false;
        if (event.code === 'ArrowRight') this.keyRightIsDown = false;
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
        } else {
            if (this.drawingService.previewCtx === undefined) return;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
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

        const selectionPropretiesTmp: SelectionPropreties = {
            selectionType: SelectionType.Rectangle,
            selectionCtx: ctx,
            imageData: this.data,
            topLeft: this.initialTopLeft,
            bottomRight: this.initialBottomRight,
            finalTopLeft: this.finalTopLeft,
            finalBottomRight: this.finalBottomRight,
        };
        this.fillWithWhite(selectionPropretiesTmp);
    }

    setOffSet(pos: Vec2): void {
        this.offset = { x: pos.x - this.finalTopLeft.x, y: pos.y - this.finalTopLeft.y };
    }

    abstract drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void;

    abstract draw(ctx: CanvasRenderingContext2D): void;
    abstract finalDrawDown(ctx: CanvasRenderingContext2D): void;

    abstract fillWithWhite(selectionPropreties: SelectionPropreties): void;
}
