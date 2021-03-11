import { Color } from '@app/classes/color';
import { MouseButton, Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';

export abstract class SelectionTool extends Tool {
    constructor(drawingService: DrawingService, protected rectangleDrawingService: RectangleDrawingService, toolName: string) {
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
                this.initialBottomRight = this.rectangleDrawingService.getTrueEndCoords(this.initialTopLeft, this.getPositionFromMouse(event));
            } else {
                this.initialBottomRight = this.getPositionFromMouse(event);
            }
            this.rectangleDrawingService.alternateShape = false;
            this.adjustToBounds();

            this.drawingService.clearCanvas(this.drawingService.previewCtx);

            if (this.initialTopLeft.x !== this.initialBottomRight.x && this.initialTopLeft.y !== this.initialBottomRight.y) {
                this.saveSelection(this.drawingService.baseCtx);
                this.drawSelection(this.drawingService.previewCtx);
                this.drawPerimeter(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
                this.drawBox(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
                this.hasSelection = true;
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey && event.code === 'KeyA') {
            if (this.hasSelection) {
                this.cancelSelection();
            }
            this.selectAll();
        }
        if (event.code === 'Escape') this.cancelSelection();
        if (event.code === 'ShiftLeft' && !this.hasSelection) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.rectangleDrawingService.onKeyDown(event);
            this.drawPerimeter(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
        }
        if (event.code === 'ArrowUp') this.handleArrowInitialTime(this.drawingService.previewCtx, 0, -3, event);
        if (event.code === 'ArrowDown') this.handleArrowInitialTime(this.drawingService.previewCtx, 0, 3, event);
        if (event.code === 'ArrowLeft') this.handleArrowInitialTime(this.drawingService.previewCtx, -3, 0, event);
        if (event.code === 'ArrowRight') this.handleArrowInitialTime(this.drawingService.previewCtx, 3, 0, event);
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.code === 'ShiftLeft' && !this.hasSelection) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.rectangleDrawingService.onKeyUp(event);
            this.drawPerimeter(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
        }

        if (this.timeoutHandler) {
            console.log('NOT Holding down');
            clearTimeout(this.timeoutHandler);
            this.timeoutHandler = 0;
        }
    }

    handleArrowInitialTime(ctx: CanvasRenderingContext2D, deltaX: number, deltaY: number, event: KeyboardEvent): void {
        const initialTimer = 500;
        this.moveSelectionArrow(ctx, deltaX, deltaY);
        setTimeout(() => {
            console.log('Holding down');
            if (event.code === null) {
                this.handleArrowContinuous(ctx, deltaX, deltaY);
            }
        }, initialTimer);
    }

    handleArrowContinuous(ctx: CanvasRenderingContext2D, deltaX: number, deltaY: number): void {
        const initialTimer = 100;
        this.timeoutHandler = setTimeout(() => {
            console.log('Holding down 100 ms');
            this.moveSelectionArrow(ctx, deltaX, deltaY);
            this.timeoutHandler = 0;
        }, initialTimer);
    }

    moveSelectionArrow(ctx: CanvasRenderingContext2D, deltaX: number, deltaY: number): void {
        this.finalTopLeft.x += deltaX;
        this.finalTopLeft.y += deltaY;
        this.finalBottomRight.x += deltaX;
        this.finalBottomRight.y += deltaY;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawSelection(ctx);
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
        this.drawSelection(this.drawingService.previewCtx);
        this.drawPerimeter(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
        this.drawBox(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
        this.hasSelection = true;
    }

    cancelSelection(): void {
        if (this.hasSelection) {
            this.drawSelection(this.drawingService.baseCtx);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.hasSelection = false;
        }
    }

    abstract moveSelection(ctx: CanvasRenderingContext2D, pos: Vec2): void;

    abstract drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void;

    abstract drawBox(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void;

    abstract drawSelection(ctx: CanvasRenderingContext2D): void;

    abstract isInsideSelection(point: Vec2): boolean;

    abstract saveSelection(ctx: CanvasRenderingContext2D): void;

    abstract setOffSet(pos: Vec2): void;
}
