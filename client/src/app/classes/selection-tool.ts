import { Color } from '@app/classes/color';
import { MouseButton, Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';

export abstract class SelectionTool extends Tool {
    constructor(drawingService: DrawingService, toolName: string) {
        super(drawingService, toolName);
    }
    readonly boxColor: Color = { rgbValue: '#0000FF', opacity: 1 };
    movingSelection: boolean = false;
    hasSelection: boolean = false;
    protected initialTopLeft: Vec2 = { x: 0, y: 0 };
    protected initialBottomRight: Vec2 = { x: 0, y: 0 };
    protected finalTopLeft: Vec2 = { x: 0, y: 0 };
    protected finalBottomRight: Vec2 = { x: 0, y: 0 };

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (!this.mouseDown) return;
        if (this.isInsideSelection(this.getPositionFromMouse(event))) {
            this.setOffSet(this.getPositionFromMouse(event));
            this.movingSelection = true;
            return;
        }
        if (this.hasSelection) {
            this.drawSelection(this.drawingService.baseCtx);
            this.hasSelection = false;
        }
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
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        this.drawPerimeter(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
        this.drawBox(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.mouseDown = false;

            if (this.movingSelection) {
                this.movingSelection = false;
                return;
            }
            this.initialBottomRight = this.getPositionFromMouse(event);

            this.drawingService.clearCanvas(this.drawingService.previewCtx);

            this.saveSelection(this.drawingService.baseCtx);
            this.drawSelection(this.drawingService.previewCtx);
            this.drawPerimeter(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
            this.drawBox(this.drawingService.previewCtx, this.initialTopLeft, this.initialBottomRight);
            this.hasSelection = true;
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
