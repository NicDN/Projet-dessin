import { Injectable } from '@angular/core';
import { MouseButton } from '@app/classes/tool';
import { TraceTool } from '@app/classes/trace-tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class PencilService extends TraceTool {
    isEraser: boolean;
    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService, 'Crayon');
        this.mouseDownCoord = { x: 0, y: 0 };
        this.clearPath();
        this.isEraser = false;
    }

    private pathData: Vec2[];

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawLine(this.drawingService.baseCtx, this.pathData);
            this.clearPreviewIfNotEraser(this.isEraser);
        }
        this.mouseDown = false;
        this.clearPath();
    }

    clearPreviewIfNotEraser(isEraser: boolean): void {
        if (!isEraser) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        }
    }

    everyMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.previewCtx, this.pathData);
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.everyMouseMove(event);
    }

    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.save();
        this.setContext(ctx);
        let oldPointX: number = path[0].x;
        let oldPointY: number = path[0].y;

        ctx.beginPath();
        for (const point of path) {
            ctx.moveTo(oldPointX, oldPointY);
            ctx.strokeStyle = this.colorService.mainColor.rgbValue;
            ctx.lineTo(point.x, point.y);

            oldPointX = point.x;
            oldPointY = point.y;
        }
        ctx.stroke();
        ctx.restore();
    }

    setContext(ctx: CanvasRenderingContext2D): void {
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.lineWidth = this.thickness;
        ctx.globalAlpha = this.colorService.mainColor.opacity;
        ctx.strokeStyle = this.colorService.mainColor.rgbValue;
    }

    private clearPath(): void {
        this.pathData = [];
    }

    onMouseOut(event: MouseEvent): void {
        this.onMouseUp(event);
    }

    onMouseEnter(event: MouseEvent): void {
        // event.buttons is 1 when left click is pressed.
        if (event.buttons === 1) {
            this.mouseDown = true;
        }
    }
}
