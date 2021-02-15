import { Injectable } from '@angular/core';
import { MouseButton } from '@app/classes/tool';
import { TraceTool } from '@app/classes/trace-tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

const HALF_CIRCLE = 180;
const QUARTER_CIRCLE = 90;

@Injectable({
    providedIn: 'root',
})
export class LineService extends TraceTool {
    readonly INITIAL_JUNCTION_DIAMETER_PX: number = 5;
    readonly MAX_JUNCTION_DIAMETER: number = 5;

    isShiftDown: boolean = false;
    canDoubleClick: boolean = false;

    drawWithJunction: boolean;
    junctionDiameter: number;

    pathData: Vec2[];
    mousePosition: Vec2;

    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService, 'Ligne');
        this.clearPath();
        this.drawWithJunction = false;
        this.junctionDiameter = this.INITIAL_JUNCTION_DIAMETER_PX;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
    }

    onMouseUp(event: MouseEvent): void {
        if (event.button !== MouseButton.Left || !this.mouseDown) {
            return;
        }
        if (!this.canDoubleClick) {
            this.addPoint();
            this.canDoubleClick = true;
        } else if (this.pathData.length > 1) {
            this.finishLine();
        }
        this.mouseDown = false;
        const DELAY = 200;
        setTimeout(() => {
            this.canDoubleClick = false;
        }, DELAY);
    }

    onMouseMove(event: MouseEvent): void {
        this.mousePosition = this.getPositionFromMouse(event);
        this.pathData.pop();
        this.pathData.push(this.mousePosition);

        if (this.isShiftDown) {
            this.lockLine();
        } else {
            this.updatePreview();
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        switch (event.code) {
            case 'Escape':
                this.clearPath();
                break;
            case 'Backspace':
                this.removePoint();
                break;
            case 'ShiftRight':
            case 'ShiftLeft':
                this.isShiftDown = true;
                this.lockLine();
                break;
            default:
                break;
        }
        this.updatePreview();
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
            this.isShiftDown = false;
            this.pathData.pop();
            this.pathData.push(this.mousePosition);
            this.updatePreview();
        }
    }

    addPoint(): void {
        this.pathData.push(this.mousePosition);
        this.updatePreview();
    }

    removePoint(): void {
        const MIN_LENGTH_FOR_REMOVING_DOT = 2;
        if (this.pathData.length > MIN_LENGTH_FOR_REMOVING_DOT) {
            this.pathData.pop();
            this.pathData.pop();
            this.pathData.push(this.mousePosition);
        }
    }

    finishLine(): void {
        const MAX_OFFSET = 20;
        const firstPos = this.pathData[0];
        const dx = Math.abs(firstPos.x - this.mousePosition.x);
        const dy = Math.abs(firstPos.y - this.mousePosition.y);

        if (dx <= MAX_OFFSET && dy <= MAX_OFFSET) {
            this.pathData.pop();
            this.pathData.pop();
            this.pathData.push(this.pathData[0]);
        }

        this.drawLine(this.drawingService.baseCtx, this.pathData);
        this.clearPath();
        this.updatePreview();
    }

    updatePreview(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawLine(this.drawingService.previewCtx, this.pathData);
    }

    calculateAngle(point: Vec2): number {
        const FULL_CIRCLE = 360;

        const dx = this.mousePosition.x - point.x;
        const dy = this.mousePosition.y - point.y;
        const rads = Math.atan2(dx, dy);
        let degrees = (rads * HALF_CIRCLE) / Math.PI;

        while (degrees < 0) degrees += FULL_CIRCLE;
        return degrees;
    }

    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
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

    lockLine(): void {
        const FORTHY_FIVE_DEGREE = 45;
        const HALF_FF_DEGREE = 22.5;

        const lastSelectedPoint = this.pathData[this.pathData.length - 2];
        const angle = this.calculateAngle(lastSelectedPoint);

        const tempMousePosition: Vec2 = { x: this.mousePosition.x, y: this.mousePosition.y };

        const dx = this.mousePosition.x - lastSelectedPoint.x;

        const quarterAngle = Math.abs(Math.abs(angle - HALF_CIRCLE) - QUARTER_CIRCLE);
        const diagonalAngle = Math.abs(Math.abs(angle - HALF_CIRCLE - FORTHY_FIVE_DEGREE) - QUARTER_CIRCLE);

        if (quarterAngle <= HALF_FF_DEGREE) {
            tempMousePosition.y = lastSelectedPoint.y;
        } else if (quarterAngle >= QUARTER_CIRCLE - HALF_FF_DEGREE) {
            tempMousePosition.x = lastSelectedPoint.x;
        } else if (diagonalAngle <= HALF_FF_DEGREE) {
            tempMousePosition.y = lastSelectedPoint.y - dx;
        } else {
            tempMousePosition.y = lastSelectedPoint.y + dx;
        }
        this.pathData.pop();
        this.pathData.push(tempMousePosition);
        this.updatePreview();
    }

    clearPath(): void {
        this.pathData = [];
    }
}