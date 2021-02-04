import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MouseButton, Tool } from './tool';
import { Vec2 } from './vec2';

export enum DrawingType {
    Bordered,
    FilledNoBordered,
    FilledAndBordered,
}
export abstract class Shape extends Tool {
    private beginCoord: Vec2;
    private endCoord: Vec2;
    protected thickness: number;
    protected drawingType: DrawingType;
    protected alternateShape: boolean;
    readonly dashSize: number = 5;

    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService);
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.beginCoord = this.getPositionFromMouse(event);
            this.endCoord = this.beginCoord;
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.endCoord = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.draw(this.drawingService.baseCtx, this.beginCoord, this.endCoord);
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.endCoord = this.getPositionFromMouse(event);
            this.drawPreview();
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.code === 'ShiftLeft') this.alternateShape = true;
        if (this.mouseDown) this.drawPreview();
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.code === 'ShiftLeft') this.alternateShape = false;
        if (this.mouseDown) this.drawPreview();
    }

    // onMouseEnter(event: MouseEvent): void {}

    // onMouseOut(event: MouseEvent): void {}

    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.setLineDash([this.dashSize * 2, this.dashSize]);
        ctx.rect(begin.x, begin.y, end.x - begin.x, end.y - begin.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawPreview(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawPerimeter(this.drawingService.previewCtx, this.beginCoord, this.endCoord);
        this.draw(this.drawingService.previewCtx, this.beginCoord, this.endCoord);
    }

    abstract draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void;
}
