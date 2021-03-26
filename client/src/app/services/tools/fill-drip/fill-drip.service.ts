import { Injectable } from '@angular/core';
import { TraceTool } from '@app/classes/trace-tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class FillDripService extends TraceTool {
    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService, 'Sceau de peinture');
    }
}