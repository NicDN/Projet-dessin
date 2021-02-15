import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';

@Injectable({
    providedIn: 'root',
})
export class EraserService extends PencilService {
    readonly MINTHICKNESS: number = 5;

    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService);
        this.thickness = this.MINTHICKNESS;
        this.minThickness = this.MINTHICKNESS;
        this.toolName = 'Efface';
        this.isEraser = true;
    }

    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx = this.drawingService.baseCtx;
        this.verifThickness(ctx, this.thickness);

        if (this.singleClick(path)) {
            this.eraseSquare(ctx, { x: path[0].x, y: path[0].y });
            return;
        }

        let oldPointX: number = path[0].x;
        let oldPointY: number = path[0].y;

        for (const point of path) {
            const dist = this.distanceBetween({ x: oldPointX, y: oldPointY }, { x: point.x, y: point.y });
            const angle = this.angleBetween({ x: oldPointX, y: oldPointY }, { x: point.x, y: point.y });

            for (let i = 0; i < dist; i += 1) {
                const xValue = oldPointX + Math.sin(angle) * i;
                const yValue = oldPointY + Math.cos(angle) * i;
                this.eraseSquare(ctx, { x: xValue, y: yValue });
            }

            oldPointX = point.x;
            oldPointY = point.y;
        }
    }

    distanceBetween(point1: Vec2, point2: Vec2): number {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }

    angleBetween(point1: Vec2, point2: Vec2): number {
        return Math.atan2(point2.x - point1.x, point2.y - point1.y);
    }

    verifThickness(ctx: CanvasRenderingContext2D, thickness: number): void {
        if (thickness < this.MINTHICKNESS) thickness = this.MINTHICKNESS;
        ctx.lineWidth = thickness;
    }

    singleClick(path: Vec2[]): boolean {
        return path.length === 2;
    }

    eraseSquare(ctx: CanvasRenderingContext2D, point: Vec2): void {
        ctx.clearRect(point.x - Math.floor(this.thickness / 2), point.y - Math.floor(this.thickness / 2), this.thickness, this.thickness);
    }

    onMouseMove(event: MouseEvent): void {
        this.everyMouseMove(event);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.displayPreview(event);
    }

    displayPreview(event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        const ctx = this.drawingService.previewCtx;
        this.setAttributesDisplay(ctx);

        ctx.beginPath();
        ctx.rect(
            mousePosition.x - Math.floor(this.thickness / 2) + 1,
            mousePosition.y - Math.floor(this.thickness / 2) + 1,
            this.thickness - 2,
            this.thickness - 2,
        );
        ctx.fill();
        ctx.beginPath();
        ctx.rect(mousePosition.x - Math.floor(this.thickness / 2), mousePosition.y - Math.floor(this.thickness / 2), this.thickness, this.thickness);
        ctx.stroke();
    }

    setAttributesDisplay(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 1;
    }
}
