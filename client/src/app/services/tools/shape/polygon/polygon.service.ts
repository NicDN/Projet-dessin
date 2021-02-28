import { Injectable } from '@angular/core';
import { Shape } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class PolygonService extends Shape {
    draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        throw new Error('Method not implemented.');
    }

    executeShapeCommand(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2){
        throw new Error('Method not implemented');
    }

    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService, 'Polygone');
    }
}
