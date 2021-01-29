import { Injectable } from '@angular/core';
import { Shape } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class EllipseDrawingService extends Shape {
    thickness: number;
    draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        ctx.beginPath();
        ctx.ellipse((end.x + begin.x) / 2, (end.y + begin.y) / 2, (end.x - begin.x) / 2, (end.y - begin.y) / 2, 0, 0, 2 * Math.PI);
        ctx.stroke();
    }
}
