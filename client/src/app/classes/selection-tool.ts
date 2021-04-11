import { SelectionCommand, SelectionPropreties } from '@app/classes/commands/selection-command/selection-command';
import { HORIZONTAL_OFFSET, MouseButton, Tool, VERTICAL_OFFSET } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MoveSelectionService, SelectedPoint } from '@app/services/tools/selection/move-selection.service';
import { ResizeSelectionService } from '@app/services/tools/selection/resize-selection.service';
import { RectangleDrawingService as ShapeService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

export interface SelectionCoords {
    initialTopLeft: Vec2;
    initialBottomRight: Vec2;
    finalTopLeft: Vec2;
    finalBottomRight: Vec2;
}
// tslint:disable: no-magic-numbers
export abstract class SelectionTool extends Tool {
    constructor(
        drawingService: DrawingService,
        protected shapeService: ShapeService,
        toolName: string,
        protected undoRedoService: UndoRedoService,
        protected moveSelectionService: MoveSelectionService,
        protected resizeSelectionService: ResizeSelectionService,
    ) {
        super(drawingService, toolName);
    }

    data: ImageData;
    selectionExists: boolean = false;
    private readonly selectionOffSet: number = 13;

    private intervalHandler: number;
    private timeoutHandler: number;
    readonly INITIAL_ARROW_TIMER: number = 500;
    readonly ARROW_INTERVAL: number = 100;

    coords: SelectionCoords = {
        initialTopLeft: { x: 0, y: 0 },
        initialBottomRight: { x: 0, y: 0 },
        finalTopLeft: { x: 0, y: 0 },
        finalBottomRight: { x: 0, y: 0 },
    };

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (!this.mouseDown) return;
        if (this.isInsideSelection(this.getPositionFromMouse(event)) && this.selectionExists) {
            this.handleSelectionMouseDown(event);
            return;
        }
        this.undoRedoService.disableUndoRedo();
        this.cancelSelection();
        this.coords.initialTopLeft = this.getPositionFromMouse(event);
        this.coords.initialBottomRight = this.coords.initialTopLeft;
    }

    handleSelectionMouseDown(event: MouseEvent): void {
        this.resizeSelectionService.checkIfAControlPointHasBeenSelected(this.getPositionFromMouse(event), this.coords, false);
        if (
            this.resizeSelectionService.selectedPointIndex === SelectedPoint.NO_POINT ||
            this.resizeSelectionService.selectedPointIndex === SelectedPoint.CENTER
        ) {
            this.setOffSet(this.getPositionFromMouse(event));
            this.moveSelectionService.movingWithMouse = true;
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.resizeSelectionService.previewSelectedPointIndex = this.isInsideSelection(this.getPositionFromMouse(event)) ? 9 : SelectedPoint.NO_POINT;
        this.resizeSelectionService.checkIfAControlPointHasBeenSelected(this.getPositionFromMouse(event), this.coords, true);

        // 1 = leftclick
        if (event.buttons !== 1) this.mouseDown = false;
        if (!this.mouseDown) return;

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

        this.coords.initialBottomRight = this.getPositionFromMouse(event);
        this.adjustToDrawingBounds();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawPerimeter(this.drawingService.previewCtx, this.coords.initialTopLeft, this.coords.initialBottomRight);
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.mouseDown) return;
        this.mouseDown = false;

        if (this.resizeSelectionService.selectedPointIndex !== -1) {
            this.resizeSelectionService.selectedPointIndex = -1;
            return;
        }
        if (this.moveSelectionService.movingWithMouse) {
            this.moveSelectionService.movingWithMouse = false;
            return;
        }

        this.coords.initialBottomRight = this.getPositionFromMouse(event);
        this.adjustToDrawingBounds();
        this.coords.initialBottomRight = this.shapeService.getTrueEndCoords(
            this.coords.initialTopLeft,
            this.coords.initialBottomRight,
            this.shapeService.alternateShape,
        );
        this.shapeService.alternateShape = false;

        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.createSelection();
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.code === 'Escape') this.cancelSelection();
        if (event.code === 'ShiftLeft') {
            if (!this.selectionExists) {
                this.handleLeftShift(event, this.shapeService.onKeyDown);
            } else {
                this.resizeSelectionService.lastDimensions = {
                    x: Math.abs(this.coords.finalBottomRight.x - this.coords.finalTopLeft.x),
                    y: Math.abs(this.coords.finalBottomRight.y - this.coords.finalTopLeft.y),
                };
                this.resizeSelectionService.shiftKeyIsDown = true;
            }
        }
        if (this.selectionExists) this.handleMovingArrowsKeyDown(event);
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.code === 'ShiftLeft') {
            if (!this.selectionExists) {
                this.handleLeftShift(event, this.shapeService.onKeyUp);
            } else {
                this.resizeSelectionService.shiftKeyIsDown = false;
                this.resizeSelectionService.resizeSelection(this.resizeSelectionService.lastMousePos, this.coords);
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.drawAll(this.drawingService.previewCtx);
            }
        }

        this.handleMovingArrowsKeyUp(event);
    }

    private handleLeftShift(event: KeyboardEvent, callback: (keyEvent: KeyboardEvent) => void): void {
        callback.call(this.shapeService, event);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawPerimeter(this.drawingService.previewCtx, this.coords.initialTopLeft, this.coords.initialBottomRight);
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
                this.coords,
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
                    this.moveSelectionService.moveSelectionWithArrows(ctx, this.moveSelectionService.calculateDelta(), this.coords);
                    this.drawAll(ctx);
                }).bind(this),
                this.ARROW_INTERVAL,
                ctx,
                this.moveSelectionService.calculateDelta(),
            ) as unknown) as number;
        }
    }

    protected createSelection(): void {
        if (this.coords.initialTopLeft.x === this.coords.initialBottomRight.x || this.coords.initialTopLeft.y === this.coords.initialBottomRight.y) {
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
            this.coords.initialTopLeft.x,
            this.coords.initialTopLeft.y,
            this.coords.initialBottomRight.x - this.coords.initialTopLeft.x,
            this.coords.initialBottomRight.y - this.coords.initialTopLeft.y,
        );
        this.fillWithWhite(this.loadUpProperties(ctx));
    }

    private setSelectionCoords(): void {
        this.coords.finalTopLeft = {
            x: Math.min(this.coords.initialTopLeft.x, this.coords.initialBottomRight.x),
            y: Math.min(this.coords.initialTopLeft.y, this.coords.initialBottomRight.y),
        };
        this.coords.finalBottomRight = {
            x: Math.max(this.coords.initialTopLeft.x, this.coords.initialBottomRight.x),
            y: Math.max(this.coords.initialTopLeft.y, this.coords.initialBottomRight.y),
        };
        this.coords.initialTopLeft = { x: this.coords.finalTopLeft.x, y: this.coords.finalTopLeft.y };
        this.coords.initialBottomRight = { x: this.coords.finalBottomRight.x, y: this.coords.finalBottomRight.y };
    }

    private adjustToDrawingBounds(): void {
        if (this.coords.initialBottomRight.x < 0) this.coords.initialBottomRight.x = 0;
        if (this.coords.initialBottomRight.x > this.drawingService.canvas.width) this.coords.initialBottomRight.x = this.drawingService.canvas.width;

        if (this.coords.initialBottomRight.y < 0) this.coords.initialBottomRight.y = 0;
        if (this.coords.initialBottomRight.y > this.drawingService.canvas.height)
            this.coords.initialBottomRight.y = this.drawingService.canvas.height;
    }

    cancelSelection(): void {
        if (this.drawingService.previewCtx === undefined) return;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.selectionExists) {
            this.draw(this.drawingService.baseCtx);
            this.coords.initialTopLeft = { x: 0, y: 0 };
            this.coords.initialBottomRight = { x: 0, y: 0 };
            this.coords.finalBottomRight = { x: 0, y: 0 };
            this.coords.finalTopLeft = { x: 0, y: 0 };
            this.selectionExists = false;
            this.moveSelectionService.movingWithMouse = false;
            this.moveSelectionService.movingWithArrows = false;
            clearInterval(this.intervalHandler);
            this.intervalHandler = 0;
            this.undoRedoService.enableUndoRedo();
            return;
        }

        this.coords.initialTopLeft = { x: this.coords.initialBottomRight.x, y: this.coords.initialBottomRight.y };
    }

    drawAll(ctx: CanvasRenderingContext2D): void {
        this.draw(ctx);
        this.drawPerimeter(ctx, this.coords.finalTopLeft, this.coords.finalBottomRight);
        this.resizeSelectionService.drawBox(ctx, this.coords.finalTopLeft, this.coords.finalBottomRight);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const selectionCommand: SelectionCommand = new SelectionCommand(this.loadUpProperties(ctx), this);
        selectionCommand.execute();
        if (ctx === this.drawingService.baseCtx && this.selectionHasChanged()) this.undoRedoService.addCommand(selectionCommand);
    }

    selectionHasChanged(): boolean {
        return (
            this.coords.initialTopLeft.x !== this.coords.finalTopLeft.x ||
            this.coords.initialTopLeft.y !== this.coords.finalTopLeft.y ||
            this.coords.finalBottomRight.x !== this.coords.initialBottomRight.x ||
            this.coords.finalBottomRight.y !== this.coords.initialBottomRight.y
        );
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
        const minX = Math.min(this.coords.finalTopLeft.x, this.coords.finalBottomRight.x);
        const maxX = Math.max(this.coords.finalTopLeft.x, this.coords.finalBottomRight.x);
        const minY = Math.min(this.coords.finalTopLeft.y, this.coords.finalBottomRight.y);
        const maxY = Math.max(this.coords.finalTopLeft.y, this.coords.finalBottomRight.y);

        return (
            point.x > minX - this.selectionOffSet &&
            point.x < maxX + this.selectionOffSet &&
            point.y > minY - this.selectionOffSet &&
            point.y < maxY + this.selectionOffSet
        );
    }

    protected setOffSet(pos: Vec2): void {
        this.moveSelectionService.mouseMoveOffset = {
            x: pos.x - this.coords.finalTopLeft.x,
            y: pos.y - this.coords.finalTopLeft.y,
        };
    }

    protected loadUpProperties(ctx?: CanvasRenderingContext2D): SelectionPropreties {
        return {
            selectionCtx: ctx,
            imageData: this.data,
            topLeft: this.coords.initialTopLeft,
            bottomRight: this.coords.initialBottomRight,
            finalTopLeft: this.coords.finalTopLeft,
            finalBottomRight: this.coords.finalBottomRight,
        };
    }

    abstract drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void;

    abstract drawSelection(selectionPropreties: SelectionPropreties): void;

    abstract fillWithWhite(selectionPropreties: SelectionPropreties): void;
    // tslint:disable-next-line: max-file-line-count
}
