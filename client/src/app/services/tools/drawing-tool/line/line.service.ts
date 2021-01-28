import { Injectable } from '@angular/core';
import { DrawingTool } from '@app/classes/drawing-tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
// import { ColorService } from '@app/services/color/color.service';

@Injectable({
    providedIn: 'root',
})
export class LineService extends DrawingTool {
    constructor(drawingService: DrawingService) {
        super(drawingService);
    }
    draw(event: MouseEvent): void {
        throw new Error('Method not implemented.');
    }
}
