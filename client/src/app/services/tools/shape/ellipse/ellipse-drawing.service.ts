import { Injectable } from '@angular/core';
import { Shape } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class EllipseDrawingService extends Shape {
    thickness: number;

    constructor(drawingService: DrawingService) {
        super(drawingService);
    }
    draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        ctx.beginPath();
        ctx.ellipse((end.x + begin.x) / 2, (end.y + begin.y) / 2, (end.x - begin.x) / 2, (end.y - begin.y) / 2, 0, 0, 2 * Math.PI);
        ctx.stroke();
    }
}
