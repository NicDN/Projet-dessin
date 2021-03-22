import { Color } from '@app/classes/color';
import { SelectionCommand, SelectionPropreties } from '@app/classes/commands/selection-command/selection-command';
import { HORIZONTAL_OFFSET, MouseButton, Tool, VERTICAL_OFFSET } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleDrawingService as ShapeService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

export abstract class SelectionTool extends Tool {
    constructor(drawingService: DrawingService, protected shapeService: ShapeService, toolName: string, protected undoRedoService: UndoRedoService) {
        super(drawingService, toolName);
    }

    readonly boxColor: Color = { rgbValue: '#0000FF', opacity: 1 };
    selectionExists: boolean = false;
    protected data: ImageData;

    movingWithMouse: boolean = false;
    protected mouseMoveOffset: Vec2;

    readonly arrowMoveDelta: number = 3;
    movingWithArrows: boolean = false;
    keyUpIsPressed: boolean = false;
    keyDownIsPressed: boolean = false;
    keyLeftIsPressed: boolean = false;
    keyRightIsPressed: boolean = false;
    initialKeyPress: boolean = false;
    intervalHandler: number;
    private timeoutHandler: number;
    readonly INITIAL_ARROW_TIMER: number = 500;
    readonly ARROW_INTERVAL: number = 100;

    protected initialTopLeft: Vec2 = { x: 0, y: 0 };
    protected initialBottomRight: Vec2 = { x: 0, y: 0 };
    protected finalTopLeft: Vec2 = { x: 0, y: 0 };
    protected finalBottomRight: Vec2 = { x: 0, y: 0 };

    readonly controlPointWidth: number = 6;
    readonly halfControlPointWidth: number = this.controlPointWidth / 2;

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (!this.mouseDown) return;
        if (this.isInsideSelection(this.getPositionFromMouse(event)) && this.selectionExists) {
            this.setOffSet(this.getPositionFromMouse(event));
            this.movingWithMouse = true;
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

        if (this.movingWithMouse) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.moveSelectionWithMouse(this.drawingService.previewCtx, this.getPositionFromMouse(event));
            return;
        }

        this.initialBottomRight = this.getPositionFromMouse(event);
        this.adjustToDrawingBounds();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawPerimeter(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.mouseDown) return;
        this.mouseDown = false;

        if (this.movingWithMouse) {
            this.movingWithMouse = false;
            return;
        }

        this.initialBottomRight = this.shapeService.alternateShape
            ? this.shapeService.getTrueEndCoords(this.initialTopLeft, this.getPositionFromMouse(event), this.shapeService.alternateShape)
            : (this.initialBottomRight = this.getPositionFromMouse(event));

        this.shapeService.alternateShape = false;
        this.adjustToDrawingBounds();

        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.createSelection();
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.code === 'Escape') this.cancelSelection();
        if (event.code === 'ShiftLeft' && !this.selectionExists) this.handleLeftShift(event, this.shapeService.onKeyDown);
        this.handleMovingArrowsKeyDown(event);
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.code === 'ShiftLeft' && !this.selectionExists) this.handleLeftShift(event, this.shapeService.onKeyUp);
        this.handleMovingArrowsKeyUp(event);
    }

    handleLeftShift(event: KeyboardEvent, callback: (keyEvent: KeyboardEvent) => void): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        callback.call(this.shapeService, event);
        this.drawPerimeter(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
    }

    handleMovingArrowsKeyDown(event: KeyboardEvent): void {
        this.updateArrowKeysPressed(event, true);
        if (this.checkIfAnyArrowIsPressed() && !this.movingWithArrows && !this.initialKeyPress)
            this.handleArrowInitialTime(this.drawingService.previewCtx, event);
    }

    handleMovingArrowsKeyUp(event: KeyboardEvent): void {
        if (this.initialKeyPress) {
            this.initialKeyPress = false;
            clearTimeout(this.timeoutHandler);
            this.timeoutHandler = 0;
            const delta = this.calculateDelta();
            this.moveSelectionWithArrows(this.drawingService.previewCtx, delta.x, delta.y);
        }
        this.updateArrowKeysPressed(event, false);

        if (!this.checkIfAnyArrowIsPressed()) {
            this.movingWithArrows = false;
            clearInterval(this.intervalHandler);
            this.intervalHandler = 0;
        }
    }

    handleArrowInitialTime(ctx: CanvasRenderingContext2D, event: KeyboardEvent): void {
        this.initialKeyPress = true;
        this.timeoutHandler = setTimeout(() => {
            if (this.initialKeyPress) {
                this.movingWithArrows = true;
                this.intervalHandler = setInterval(() => {
                    const delta = this.calculateDelta();
                    this.moveSelectionWithArrows(ctx, delta.x, delta.y);
                }, this.ARROW_INTERVAL);
            }
        }, this.INITIAL_ARROW_TIMER);
    }

    calculateDelta(): Vec2 {
        let deltaY = 0;
        let deltaX = 0;
        if (this.keyUpIsPressed) deltaY -= this.arrowMoveDelta;
        if (this.keyDownIsPressed) deltaY += this.arrowMoveDelta;
        if (this.keyLeftIsPressed) deltaX -= this.arrowMoveDelta;
        if (this.keyRightIsPressed) deltaX += this.arrowMoveDelta;
        return { x: deltaX, y: deltaY };
    }

    checkIfAnyArrowIsPressed(): boolean {
        return this.keyUpIsPressed || this.keyDownIsPressed || this.keyLeftIsPressed || this.keyRightIsPressed;
    }

    updateArrowKeysPressed(event: KeyboardEvent, state: boolean): void {
        if (event.code === 'ArrowUp') this.keyUpIsPressed = state;
        if (event.code === 'ArrowDown') this.keyDownIsPressed = state;
        if (event.code === 'ArrowLeft') this.keyLeftIsPressed = state;
        if (event.code === 'ArrowRight') this.keyRightIsPressed = state;
    }

    moveSelectionWithArrows(ctx: CanvasRenderingContext2D, deltaX: number, deltaY: number): void {
        this.finalTopLeft.x += deltaX;
        this.finalTopLeft.y += deltaY;
        this.finalBottomRight.x += deltaX;
        this.finalBottomRight.y += deltaY;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.draw(ctx);
        this.drawPerimeter(ctx, this.finalTopLeft, this.finalBottomRight);
        this.drawBox(ctx, this.finalTopLeft, this.finalBottomRight);
    }

    moveSelectionWithMouse(ctx: CanvasRenderingContext2D, pos: Vec2): void {
        this.finalTopLeft = { x: pos.x - this.mouseMoveOffset.x, y: pos.y - this.mouseMoveOffset.y };
        this.finalBottomRight = {
            x: this.finalTopLeft.x + Math.abs(this.initialBottomRight.x - this.initialTopLeft.x),
            y: this.finalTopLeft.y + Math.abs(this.initialBottomRight.y - this.initialTopLeft.y),
        };

        this.draw(ctx);
        this.drawPerimeter(ctx, this.finalTopLeft, this.finalBottomRight);
        this.drawBox(ctx, this.finalTopLeft, this.finalBottomRight);
    }

    createSelection(): void {
        if (this.initialTopLeft.x === this.initialBottomRight.x || this.initialTopLeft.y === this.initialBottomRight.y) return;
        this.saveSelection(this.drawingService.baseCtx);
        this.draw(this.drawingService.previewCtx);
        this.drawPerimeter(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
        this.drawBox(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
        this.selectionExists = true;
        this.undoRedoService.disableUndoRedo();
    }

    saveSelection(ctx: CanvasRenderingContext2D): void {
        this.setSelectionCoords();

        this.data = ctx.getImageData(
            this.initialTopLeft.x,
            this.initialTopLeft.y,
            this.initialBottomRight.x - this.initialTopLeft.x,
            this.initialBottomRight.y - this.initialTopLeft.y,
        );
        this.fillWithWhite(this.loadUpProperties(ctx));
    }

    setSelectionCoords(): void {
        this.finalTopLeft = {
            x: Math.min(this.initialTopLeft.x, this.initialBottomRight.x),
            y: Math.min(this.initialTopLeft.y, this.initialBottomRight.y),
        };
        this.finalBottomRight = {
            x: Math.max(this.initialTopLeft.x, this.initialBottomRight.x),
            y: Math.max(this.initialTopLeft.y, this.initialBottomRight.y),
        };
        this.initialTopLeft = { x: this.finalTopLeft.x, y: this.finalTopLeft.y };
        this.initialBottomRight = { x: this.finalBottomRight.x, y: this.finalBottomRight.y };
    }

    adjustToDrawingBounds(): void {
        if (this.initialBottomRight.x < 0) this.initialBottomRight.x = 0;
        if (this.initialBottomRight.x > this.drawingService.canvas.width) this.initialBottomRight.x = this.drawingService.canvas.width;

        if (this.initialBottomRight.y < 0) this.initialBottomRight.y = 0;
        if (this.initialBottomRight.y > this.drawingService.canvas.height) this.initialBottomRight.y = this.drawingService.canvas.height;
    }

    cancelSelection(): void {
        if (this.drawingService.previewCtx === undefined) return;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.selectionExists) {
            this.draw(this.drawingService.baseCtx);
            this.selectionExists = false;
            this.movingWithMouse = false;
            this.undoRedoService.enableUndoRedo();
            return;
        }

        this.initialTopLeft = { x: this.initialBottomRight.x, y: this.initialBottomRight.y };
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const selectionCommand: SelectionCommand = new SelectionCommand(this.loadUpProperties(ctx), this);
        selectionCommand.execute();
        if (ctx === this.drawingService.baseCtx && this.initialTopLeft !== this.finalTopLeft) this.undoRedoService.addCommand(selectionCommand);
    }

    drawBox(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        const trueEndCoords = this.shapeService.getTrueEndCoords(begin, end, this.shapeService.alternateShape);
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
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'blue';
        this.getControlPointsCoords(begin, end).forEach((coord: Vec2) => ctx.rect(coord.x, coord.y, this.controlPointWidth, this.controlPointWidth));
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }

    selectAll(): void {
        this.onMouseDown({ pageX: 0 + HORIZONTAL_OFFSET, pageY: 0 + VERTICAL_OFFSET, button: MouseButton.Left } as MouseEvent);
        this.onMouseUp({
            pageX: this.drawingService.canvas.width + HORIZONTAL_OFFSET,
            pageY: this.drawingService.canvas.height + VERTICAL_OFFSET,
            button: MouseButton.Left,
        } as MouseEvent);
    }

    isInsideSelection(point: Vec2): boolean {
        return (
            point.x > this.finalTopLeft.x && point.x < this.finalBottomRight.x && point.y > this.finalTopLeft.y && point.y < this.finalBottomRight.y
        );
    }

    setOffSet(pos: Vec2): void {
        this.mouseMoveOffset = { x: pos.x - this.finalTopLeft.x, y: pos.y - this.finalTopLeft.y };
    }

    getControlPointsCoords(begin: Vec2, end: Vec2): Vec2[] {
        return [
            { x: begin.x - this.halfControlPointWidth, y: begin.y - this.halfControlPointWidth },
            { x: begin.x - this.halfControlPointWidth, y: end.y - this.halfControlPointWidth },
            { x: end.x - this.halfControlPointWidth, y: begin.y - this.halfControlPointWidth },
            { x: end.x - this.halfControlPointWidth, y: end.y - this.halfControlPointWidth },
            { x: (end.x + begin.x) / 2 - this.halfControlPointWidth, y: begin.y - this.halfControlPointWidth },
            { x: (end.x + begin.x) / 2 - this.halfControlPointWidth, y: end.y - this.halfControlPointWidth },
            { x: begin.x - this.halfControlPointWidth, y: (begin.y + end.y) / 2 - this.halfControlPointWidth },
            { x: end.x - this.halfControlPointWidth, y: (begin.y + end.y) / 2 - this.halfControlPointWidth },
        ];
    }

    loadUpProperties(ctx: CanvasRenderingContext2D): SelectionPropreties {
        return {
            selectionCtx: ctx,
            imageData: this.data,
            topLeft: this.initialTopLeft,
            bottomRight: this.initialBottomRight,
            finalTopLeft: this.finalTopLeft,
            finalBottomRight: this.finalBottomRight,
        };
    }

    abstract drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void;

    abstract drawSelection(selectionPropreties: SelectionPropreties): void;

    abstract fillWithWhite(selectionPropreties: SelectionPropreties): void;
}
