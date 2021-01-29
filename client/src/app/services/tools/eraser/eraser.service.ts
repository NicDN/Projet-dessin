import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
// import { PencilService } from '../drawing-tool/pencil/pencil-service'; // use pencil to erase

@Injectable({
    providedIn: 'root',
})
export class EraserService extends Tool {
    // thicknesss: number;
    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService);
    }
}
