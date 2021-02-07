import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/drawing-tool/pencil/pencil-service';

const MINTHICKNESS = 5;

@Injectable({
    providedIn: 'root',
})
export class EraserService extends PencilService {
    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService);
        this.thickness = MINTHICKNESS;
        this.toolName = 'Efface';
    }

    distanceBetween(point1x: number, point1y: number, point2x: number, point2y: number): number {
        return Math.sqrt(Math.pow(point2x - point1x, 2) + Math.pow(point2y - point1y, 2));
    }
    angleBetween(point1x: number, point1y: number, point2x: number, point2y: number): number {
        return Math.atan2(point2x - point1x, point2y - point1y);
    }

    protected drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx = this.drawingService.baseCtx; // TO_CHANGE
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';
        let oldPointX: number = path[0].x;
        let oldPointY: number = path[0].y;
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'destination-out';
        if (this.thickness < MINTHICKNESS) this.thickness = MINTHICKNESS;
        ctx.lineWidth = this.thickness;

        if (path.length === 2) {
            ctx.beginPath();
            ctx.rect(path[0].x - this.thickness / 2, path[0].y - this.thickness / 2, this.thickness, this.thickness);
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over';
            return;
        }

        for (const point of path) {
            const dist = this.distanceBetween(oldPointX, oldPointY, point.x, point.y);
            const angle = this.angleBetween(oldPointX, oldPointY, point.x, point.y);

            for (let i = 0; i < dist; i += 1) {
                const x = oldPointX + Math.sin(angle) * i;
                const y = oldPointY + Math.cos(angle) * i;
                ctx.beginPath();
                ctx.rect(x - this.thickness / 2, y - this.thickness / 2, this.thickness, this.thickness);
                ctx.stroke();
            }

            oldPointX = point.x;
            oldPointY = point.y;
        }
        ctx.globalCompositeOperation = 'source-over';
    }

    onMouseMove(event: MouseEvent): void {
        this.everyMouseMove(event);
        this.drawingService.previewCtx.clearRect(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        this.displayPreview(event);
    }

    displayPreview(event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        const ctx = this.drawingService.previewCtx;
        ctx.beginPath();
        ctx.rect(mousePosition.x - this.thickness, mousePosition.y - this.thickness, this.thickness * 2, this.thickness * 2);
        ctx.fillStyle = 'black';
        ctx.fill();

        ctx.beginPath();
        ctx.rect(mousePosition.x - this.thickness + 1, mousePosition.y - this.thickness + 1, this.thickness * 2 - 2, this.thickness * 2 - 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    }
}
