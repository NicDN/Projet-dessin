import { Injectable } from '@angular/core';
import { DrawingTool } from '@app/classes/drawing-tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
// import { ColorService } from '@app/services/color/color.service';

@Injectable({
    providedIn: 'root',
})
export class LineService extends DrawingTool {
    // thicknesss: number;
    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService,"Ligne");
    }
    draw(event: MouseEvent): void {
        throw new Error('Method not implemented.');
    }
}
