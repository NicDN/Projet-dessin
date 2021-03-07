import { DrawingTool } from '@app/classes/drawing-tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Color } from './color';
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

    traceType: TraceType;
    alternateShape: boolean;
    readonly dashSize: number = 5;

    constructor(drawingService: DrawingService, colorService: ColorService, toolName: string) {
        super(drawingService, colorService, toolName);
        this.traceType = TraceType.FilledAndBordered;
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
            this.executeShapeCommand(this.drawingService.baseCtx, this.beginCoord, this.endCoord);
            // this.draw(this.drawingService.baseCtx, this.beginCoord, this.endCoord);
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

    onKeyDown(event: KeyboardEvent): void {
        if (event.code === 'ShiftLeft') this.alternateShape = true;
        if (this.mouseDown) this.drawPreview();
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.code === 'ShiftLeft') this.alternateShape = false;
        if (this.mouseDown) this.drawPreview();
    }

    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        ctx.save();
        ctx.beginPath();

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.setLineDash([this.dashSize * 2, this.dashSize]);

        ctx.rect(begin.x, begin.y, end.x - begin.x, end.y - begin.y);
        ctx.stroke();
        ctx.restore();
    }

    drawPreview(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawPerimeter(this.drawingService.previewCtx, this.beginCoord, this.endCoord);
        this.draw(this.drawingService.previewCtx, this.beginCoord, this.endCoord);
    }

    getTrueEndCoords(begin: Vec2, end: Vec2, isAlternateShape: boolean): Vec2 {
        let endCoordX: number = end.x;
        let endCoordY: number = end.y;
        const distX: number = Math.abs(end.x - begin.x);
        const distY: number = Math.abs(end.y - begin.y);
        if (isAlternateShape) {
            endCoordX = begin.x + Math.sign(end.x - begin.x) * Math.min(distX, distY);
            endCoordY = begin.y + Math.sign(end.y - begin.y) * Math.min(distX, distY);
        }
        return { x: endCoordX, y: endCoordY };
    }

    setFillColor(ctx: CanvasRenderingContext2D, color: Color): void {
        ctx.fillStyle = color.rgbValue;
        ctx.globalAlpha = color.opacity;
    }

    setStrokeColor(ctx: CanvasRenderingContext2D, color: Color): void {
        ctx.strokeStyle = color.rgbValue;
        ctx.globalAlpha = color.opacity;
    }

    abstract draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void;
    abstract executeShapeCommand(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void;
}
