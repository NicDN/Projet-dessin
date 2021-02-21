import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class SprayCanService extends Tool {
    // commented for tslint purposes
    // private emissionRate: number;
    // private sprayDiameter: number;
    // private dropletsDiameter: number;

    constructor(drawingService: DrawingService) {
        super(drawingService, 'Aérosol');
    }
}
