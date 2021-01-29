import { Injectable } from '@angular/core';
import { Shape } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class RectangleDrawingService extends Shape {
    thicknesss: number;
    draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        ctx.beginPath();
        ctx.rect(begin.x, begin.y, end.x - begin.x, end.y - begin.y);
        ctx.stroke();
    }
}
