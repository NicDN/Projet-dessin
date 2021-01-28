import { Injectable } from '@angular/core';
import { Shape } from '@app/classes/shape';
import { DrawingService } from '@app/services/drawing/drawing.service';
// import { ColorService } from '@app/services/color/color.service';

@Injectable({
    providedIn: 'root',
})
export class EllipseDrawingService extends Shape {
    draw(event: MouseEvent): void {
        throw new Error('Method not implemented.');
    }
    constructor(drawingService: DrawingService) {
        super(drawingService);
    }
}
