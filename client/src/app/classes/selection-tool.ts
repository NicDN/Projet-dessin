import { Color } from '@app/classes/color';
import { SelectionCommand, SelectionPropreties } from '@app/classes/commands/selection-command/selection-command';
import { HORIZONTAL_OFFSET, MouseButton, Tool, VERTICAL_OFFSET } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MoveSelectionService } from '@app/services/tools/selection/move-selection.service';
import { RectangleDrawingService as ShapeService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

export interface SelectionCoords {
    initialTopLeft: Vec2;
    initialBottomRight: Vec2;
    finalTopLeft: Vec2;
    finalBottomRight: Vec2;
}

export abstract class SelectionTool extends Tool {
    constructor(
        drawingService: DrawingService,
        protected shapeService: ShapeService,
        toolName: string,
        private undoRedoService: UndoRedoService,
        private moveSelectionService: MoveSelectionService,
    ) {
        super(drawingService, toolName);
    }

    readonly boxColor: Color = { rgbValue: '#0000FF', opacity: 1 };
    private data: ImageData;
    selectionExists: boolean = false;

    private intervalHandler: number;
    private timeoutHandler: number;
    readonly INITIAL_ARROW_TIMER: number = 500;
    readonly ARROW_INTERVAL: number = 100;

    private selectionCoords: SelectionCoords = {
        initialTopLeft: { x: 0, y: 0 },
        initialBottomRight: { x: 0, y: 0 },
        finalTopLeft: { x: 0, y: 0 },
        finalBottomRight: { x: 0, y: 0 },
    };

    readonly controlPointWidth: number = 6;
    readonly halfControlPointWidth: number = this.controlPointWidth / 2;

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (!this.mouseDown) return;
        if (this.isInsideSelection(this.getPositionFromMouse(event)) && this.selectionExists) {
            this.setOffSet(this.getPositionFromMouse(event));
            this.moveSelectionService.movingWithMouse = true;
            return;
        }
        this.undoRedoService.disableUndoRedo();
        this.cancelSelection();
        this.selectionCoords.initialTopLeft = this.getPositionFromMouse(event);
        this.selectionCoords.initialBottomRight = this.selectionCoords.initialTopLeft;
    }

    onMouseMove(event: MouseEvent): void {
        // 1 = leftclick
        if (event.buttons !== 1) {
            this.mouseDown = false;
        }
        if (!this.mouseDown) return;

        if (this.moveSelectionService.movingWithMouse) {
            this.moveSelectionService.moveSelectionWithMouse(this.drawingService.previewCtx, this.getPositionFromMouse(event), this.selectionCoords);
            this.drawAll(this.drawingService.previewCtx);
            return;
        }

        this.selectionCoords.initialBottomRight = this.getPositionFromMouse(event);
        this.adjustToDrawingBounds();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawPerimeter(this.drawingService.previewCtx, this.selectionCoords.initialTopLeft, this.selectionCoords.initialBottomRight);
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.mouseDown) return;
        this.mouseDown = false;

        if (this.moveSelectionService.movingWithMouse) {
            this.moveSelectionService.movingWithMouse = false;
            return;
        }

        this.selectionCoords.initialBottomRight = this.getPositionFromMouse(event);
        this.adjustToDrawingBounds();
        this.selectionCoords.initialBottomRight = this.shapeService.getTrueEndCoords(
            this.selectionCoords.initialTopLeft,
            this.selectionCoords.initialBottomRight,
            this.shapeService.alternateShape,
        );
        this.shapeService.alternateShape = false;

        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.createSelection();
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.code === 'Escape') this.cancelSelection();
        if (event.code === 'ShiftLeft' && !this.selectionExists) this.handleLeftShift(event, this.shapeService.onKeyDown);
        if (this.selectionExists) this.handleMovingArrowsKeyDown(event);
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.code === 'ShiftLeft' && !this.selectionExists) this.handleLeftShift(event, this.shapeService.onKeyUp);
        this.handleMovingArrowsKeyUp(event);
    }

    private handleLeftShift(event: KeyboardEvent, callback: (keyEvent: KeyboardEvent) => void): void {
        callback.call(this.shapeService, event);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawPerimeter(this.drawingService.previewCtx, this.selectionCoords.initialTopLeft, this.selectionCoords.initialBottomRight);
    }

    private handleMovingArrowsKeyDown(event: KeyboardEvent): void {
        this.moveSelectionService.updateArrowKeysPressed(event, true);
        if (
            this.moveSelectionService.checkIfAnyArrowIsPressed() &&
            !this.moveSelectionService.movingWithArrows &&
            !this.moveSelectionService.initialKeyPress
        )
            this.handleArrowInitialTime(this.drawingService.previewCtx, event);
    }

    private handleMovingArrowsKeyUp(event: KeyboardEvent): void {
        if (this.moveSelectionService.initialKeyPress) {
            this.moveSelectionService.initialKeyPress = false;
            clearTimeout(this.timeoutHandler);
            this.timeoutHandler = 0;
            this.moveSelectionService.moveSelectionWithArrows(
                this.drawingService.previewCtx,
                this.moveSelectionService.calculateDelta(),
                this.selectionCoords,
            );
            this.drawAll(this.drawingService.previewCtx);
        }
        this.moveSelectionService.updateArrowKeysPressed(event, false);

        if (!this.moveSelectionService.checkIfAnyArrowIsPressed()) {
            this.moveSelectionService.movingWithArrows = false;
            clearInterval(this.intervalHandler);
            this.intervalHandler = 0;
        }
    }

    private handleArrowInitialTime(ctx: CanvasRenderingContext2D, event: KeyboardEvent): void {
        this.moveSelectionService.initialKeyPress = true;
        this.timeoutHandler = (setTimeout(
            (() => {
                this.startContinousArrowMovement(ctx);
            }).bind(this),
            this.INITIAL_ARROW_TIMER,
            ctx,
        ) as unknown) as number;
    }

    private startContinousArrowMovement(ctx: CanvasRenderingContext2D): void {
        if (this.moveSelectionService.initialKeyPress) {
            this.moveSelectionService.initialKeyPress = false;
            this.moveSelectionService.movingWithArrows = true;

            this.intervalHandler = (setInterval(
                (() => {
                    this.moveSelectionService.moveSelectionWithArrows(ctx, this.moveSelectionService.calculateDelta(), this.selectionCoords);
                    this.drawAll(ctx);
                }).bind(this),
                this.ARROW_INTERVAL,
                ctx,
                this.moveSelectionService.calculateDelta(),
            ) as unknown) as number;
        }
    }

    private createSelection(): void {
        if (
            this.selectionCoords.initialTopLeft.x === this.selectionCoords.initialBottomRight.x ||
            this.selectionCoords.initialTopLeft.y === this.selectionCoords.initialBottomRight.y
        ) {
            this.undoRedoService.enableUndoRedo();
            return;
        }

        this.saveSelection(this.drawingService.baseCtx);

        this.drawAll(this.drawingService.previewCtx);

        this.selectionExists = true;
    }

    private saveSelection(ctx: CanvasRenderingContext2D): void {
        this.setSelectionCoords();

        this.data = ctx.getImageData(
            this.selectionCoords.initialTopLeft.x,
            this.selectionCoords.initialTopLeft.y,
            this.selectionCoords.initialBottomRight.x - this.selectionCoords.initialTopLeft.x,
            this.selectionCoords.initialBottomRight.y - this.selectionCoords.initialTopLeft.y,
        );
        this.fillWithWhite(this.loadUpProperties(ctx));
    }

    private setSelectionCoords(): void {
        this.selectionCoords.finalTopLeft = {
            x: Math.min(this.selectionCoords.initialTopLeft.x, this.selectionCoords.initialBottomRight.x),
            y: Math.min(this.selectionCoords.initialTopLeft.y, this.selectionCoords.initialBottomRight.y),
        };
        this.selectionCoords.finalBottomRight = {
            x: Math.max(this.selectionCoords.initialTopLeft.x, this.selectionCoords.initialBottomRight.x),
            y: Math.max(this.selectionCoords.initialTopLeft.y, this.selectionCoords.initialBottomRight.y),
        };
        this.selectionCoords.initialTopLeft = { x: this.selectionCoords.finalTopLeft.x, y: this.selectionCoords.finalTopLeft.y };
        this.selectionCoords.initialBottomRight = { x: this.selectionCoords.finalBottomRight.x, y: this.selectionCoords.finalBottomRight.y };
    }

    private adjustToDrawingBounds(): void {
        if (this.selectionCoords.initialBottomRight.x < 0) this.selectionCoords.initialBottomRight.x = 0;
        if (this.selectionCoords.initialBottomRight.x > this.drawingService.canvas.width)
            this.selectionCoords.initialBottomRight.x = this.drawingService.canvas.width;

        if (this.selectionCoords.initialBottomRight.y < 0) this.selectionCoords.initialBottomRight.y = 0;
        if (this.selectionCoords.initialBottomRight.y > this.drawingService.canvas.height)
            this.selectionCoords.initialBottomRight.y = this.drawingService.canvas.height;
    }

    cancelSelection(): void {
        if (this.drawingService.previewCtx === undefined) return;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.selectionExists) {
            this.draw(this.drawingService.baseCtx);
            this.selectionCoords.initialTopLeft = { x: 0, y: 0 };
            this.selectionCoords.initialBottomRight = { x: 0, y: 0 };
            this.selectionExists = false;
            this.moveSelectionService.movingWithMouse = false;
            this.moveSelectionService.movingWithArrows = false;
            clearInterval(this.intervalHandler);
            this.intervalHandler = 0;
            this.undoRedoService.enableUndoRedo();
            return;
        }

        this.selectionCoords.initialTopLeft = { x: this.selectionCoords.initialBottomRight.x, y: this.selectionCoords.initialBottomRight.y };
    }

    private drawAll(ctx: CanvasRenderingContext2D): void {
        this.draw(ctx);
        this.drawPerimeter(ctx, this.selectionCoords.finalTopLeft, this.selectionCoords.finalBottomRight);
        this.drawBox(ctx, this.selectionCoords.finalTopLeft, this.selectionCoords.finalBottomRight);
    }

    private draw(ctx: CanvasRenderingContext2D): void {
        const selectionCommand: SelectionCommand = new SelectionCommand(this.loadUpProperties(ctx), this);
        selectionCommand.execute();
        if (
            ctx === this.drawingService.baseCtx &&
            this.selectionCoords.initialTopLeft.x !== this.selectionCoords.finalTopLeft.x &&
            this.selectionCoords.initialTopLeft.y !== this.selectionCoords.finalTopLeft.y
        )
            this.undoRedoService.addCommand(selectionCommand);
    }

    private drawBox(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        ctx.save();
        ctx.lineWidth = 1;
        ctx.lineJoin = 'miter';
        ctx.strokeStyle = this.boxColor.rgbValue;
        ctx.globalAlpha = this.boxColor.opacity;
        ctx.beginPath();
        ctx.rect(begin.x, begin.y, end.x - begin.x, end.y - begin.y);
        ctx.stroke();
        ctx.restore();
        this.drawControlPoints(ctx, begin, end);
    }

    private drawControlPoints(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
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

    private isInsideSelection(point: Vec2): boolean {
        return (
            point.x > this.selectionCoords.finalTopLeft.x &&
            point.x < this.selectionCoords.finalBottomRight.x &&
            point.y > this.selectionCoords.finalTopLeft.y &&
            point.y < this.selectionCoords.finalBottomRight.y
        );
    }

    private setOffSet(pos: Vec2): void {
        this.moveSelectionService.mouseMoveOffset = {
            x: pos.x - this.selectionCoords.finalTopLeft.x,
            y: pos.y - this.selectionCoords.finalTopLeft.y,
        };
    }

    private getControlPointsCoords(begin: Vec2, end: Vec2): Vec2[] {
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

    private loadUpProperties(ctx?: CanvasRenderingContext2D): SelectionPropreties {
        return {
            selectionCtx: ctx,
            imageData: this.data,
            topLeft: this.selectionCoords.initialTopLeft,
            bottomRight: this.selectionCoords.initialBottomRight,
            finalTopLeft: this.selectionCoords.finalTopLeft,
            finalBottomRight: this.selectionCoords.finalBottomRight,
        };
    }

    abstract drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void;

    abstract drawSelection(selectionPropreties: SelectionPropreties): void;

    abstract fillWithWhite(selectionPropreties: SelectionPropreties): void;
}
