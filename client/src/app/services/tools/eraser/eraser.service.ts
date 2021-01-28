import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
// import { PencilService } from '../drawing-tool/pencil/pencil-service'; // use pencil to erase

@Injectable({
    providedIn: 'root',
})
export class EraserService extends Tool {
    constructor(drawingService: DrawingService) {
        super(drawingService);
    }
}
