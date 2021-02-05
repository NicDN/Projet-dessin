import { DrawingTool } from '@app/classes/drawing-tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MouseButton } from './tool';
import { Vec2 } from './vec2';

export enum TraceType {
    Bordered,
    FilledNoBordered,
    FilledAndBordered,
}
export abstract class Shape extends DrawingTool {
    private beginCoord: Vec2;
    private endCoord: Vec2;

    protected traceType: TraceType;
    protected alternateShape: boolean;
    readonly dashSize: number = 5;

    constructor(drawingService: DrawingService, colorService: ColorService, toolName: string) {
        super(drawingService, colorService, toolName);
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.beginCoord = this.getPositionFromMouse(event);
            this.endCoord = this.beginCoord;
        }
    }

    onMouseUp(event: MouseEvent): void {
        console.log('mouseUp');
        if (this.mouseDown) {
            this.endCoord = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.draw(this.drawingService.baseCtx, this.beginCoord, this.endCoord);
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        // 1 = leftclick
        if (event.buttons !== 1) {
            this.mouseDown = false;
        }
        if (this.mouseDown) {
            this.endCoord = this.getPositionFromMouse(event);
            this.drawPreview();
        }
    }
    setTraceType(type: number): void {
        switch (type) {
            case 0:
                this.traceType = TraceType.Bordered;
                break;
            case 1:
                this.traceType = TraceType.FilledNoBordered;
                break;
            case 2:
                this.traceType = TraceType.FilledAndBordered;
                break;
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
