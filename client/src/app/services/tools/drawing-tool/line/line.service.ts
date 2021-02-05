import { Injectable } from '@angular/core';
import { DrawingTool } from '@app/classes/drawing-tool';
import { MouseButton } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

// import { ColorService } from '@app/services/color/color.service';

@Injectable({
    providedIn: 'root',
})
export class LineService extends DrawingTool {
    thickness: number;

    isShiftDown: boolean;
    shiftAngle: number;
    lastSelectedPoint: Vec2;
    readonly INITIAL_JUNCTION_DIAMETER_PX: number = 5;

    drawWithJunction: boolean;
    junctionDiameter: number;

    private pathData: Vec2[];
    private mousePosition: Vec2;

    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService, 'Ligne');
        this.clearPath();
        this.drawWithJunction = false;
        this.junctionDiameter = this.INITIAL_JUNCTION_DIAMETER_PX;
    }
    draw(event: MouseEvent): void {
        throw new Error('Method not implemented.');
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
    }

    onMouseUp(event: MouseEvent): void {
        const MAX_OFFSET = 20;
        if (this.mouseDown) {
            const delay = 120;
            this.pathData.push(this.mousePosition);
            this.updatePreview();
            this.mouseDown = false;
            // double click
            setTimeout(() => {
                if (this.mouseDown) {
                    const firstPos = this.pathData[0];
                    if (this.mousePosition.x <= firstPos.x + MAX_OFFSET && this.mousePosition.x >= firstPos.x - MAX_OFFSET) {
                        if (this.mousePosition.y <= firstPos.y + MAX_OFFSET && this.mousePosition.y >= firstPos.y - MAX_OFFSET) {
                            // Since a double-click push 2 times the last value, we need to pop the last 2 values
                            this.pathData.pop();
                            this.pathData.pop();
                            this.pathData.push(this.pathData[0]);
                        }
                    }
                    this.drawLine(this.drawingService.baseCtx, this.pathData);
                    this.clearPath();
                    this.pathData = [];
                }
            }, delay);
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.mousePosition = this.getPositionFromMouse(event);
        this.updatePreview();
    }

    onKeyDown(event: KeyboardEvent): void {
        const MIN_LENGTH_FOR_REMOVING_DOT = 2;

        switch (event.code) {
            case 'Escape':
                this.pathData = [];
                break;
            case 'Backspace':
                if (this.pathData.length > MIN_LENGTH_FOR_REMOVING_DOT) {
                    // We need to remove the preview point AND the last selected point
                    this.pathData.pop();
                    this.pathData.pop();
                    this.pathData.push(this.mousePosition);
                }
                break;
            case 'ShiftRight':
            case 'ShiftLeft':
                this.lastSelectedPoint = this.pathData[this.pathData.length - 2];
                if (this.isShiftDown !== true) {
                    this.updateFixAngle();
                }
                this.isShiftDown = true;
                this.updatePreview();
                break;
            default:
                break;
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawLine(this.drawingService.previewCtx, this.pathData);
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
            this.isShiftDown = false;
            this.updatePreview();
        }
    }

    private updatePreview(): void {
        const HALF_ANGLE = 22.5;
        const ANGLE_SHIFT = 45;
        const MAX_ANGLE = 337.5;

        let tempMousePosition: Vec2;
        tempMousePosition = { x: this.mousePosition.x, y: this.mousePosition.y };

        // force align the line on the closest predefined axe
        if (this.isShiftDown) {
            const dx = this.mousePosition.x - this.lastSelectedPoint.x;
            let i = 0;

            if (this.shiftAngle >= MAX_ANGLE || this.shiftAngle < HALF_ANGLE + i * ANGLE_SHIFT) {
                tempMousePosition.x = this.lastSelectedPoint.x;
            } else if (this.shiftAngle < HALF_ANGLE + ++i * ANGLE_SHIFT) {
                tempMousePosition.y = this.lastSelectedPoint.y + dx;
            } else if (this.shiftAngle < HALF_ANGLE + ++i * ANGLE_SHIFT) {
                tempMousePosition.y = this.lastSelectedPoint.y;
            } else if (this.shiftAngle < HALF_ANGLE + ++i * ANGLE_SHIFT) {
                tempMousePosition.y = this.lastSelectedPoint.y - dx;
            } else if (this.shiftAngle < HALF_ANGLE + ++i * ANGLE_SHIFT) {
                tempMousePosition.x = this.lastSelectedPoint.x;
            } else if (this.shiftAngle < HALF_ANGLE + ++i * ANGLE_SHIFT) {
                tempMousePosition.y = this.lastSelectedPoint.y + dx;
            } else if (this.shiftAngle < HALF_ANGLE + ++i * ANGLE_SHIFT) {
                tempMousePosition.y = this.lastSelectedPoint.y;
            } else if (this.shiftAngle < HALF_ANGLE + ++i * ANGLE_SHIFT) {
                tempMousePosition.y = this.lastSelectedPoint.y - dx;
            }
        }

        this.pathData.pop();
        this.pathData.push(tempMousePosition);

        // We draw on the preview canvas and we erase it between each movement of the mouse
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawLine(this.drawingService.previewCtx, this.pathData);
    }

    private updateFixAngle(): void {
        const FULL_CIRCLE = 360;
        const DEMI_CIRCLE = 180;

        const dx = this.mousePosition.x - this.lastSelectedPoint.x;
        const dy = this.mousePosition.y - this.lastSelectedPoint.y;
        const rads = Math.atan2(dx, dy);
        let degrees = (rads * DEMI_CIRCLE) / Math.PI;

        while (degrees >= FULL_CIRCLE) degrees -= FULL_CIRCLE;
        while (degrees < 0) degrees += FULL_CIRCLE;

        this.shiftAngle = degrees;
    }

    private drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.globalAlpha = this.colorService.mainColor.opacity;
        ctx.strokeStyle = this.colorService.mainColor.rgbValue;
        ctx.fillStyle = this.colorService.mainColor.rgbValue;
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.beginPath();

        for (const point of path) {
            ctx.lineWidth = this.thickness;
            ctx.lineTo(point.x, point.y);
            if (this.drawWithJunction) {
                const circle = new Path2D();
                circle.arc(point.x, point.y, this.junctionDiameter, 0, 2 * Math.PI);
                ctx.fill(circle);
            }
        }
        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
