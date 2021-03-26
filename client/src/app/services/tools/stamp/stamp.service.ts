import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class StampService extends Tool {
    readonly SCALING_MAX_VALUE: number = 20; // TODO: change to appropriate value

    readonly ANGLE_MAX_VALUE: number = 360;
    readonly ANGLE_MIN_VALUE: number = 0;

    scaling: number = 1;
    angle: number = this.ANGLE_MIN_VALUE;

    constructor(drawingService: DrawingService) {
        super(drawingService, 'Étampe');
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
}
