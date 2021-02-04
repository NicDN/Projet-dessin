import { Injectable } from '@angular/core';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/drawing-tool/pencil/pencil-service';

// import { PencilService } from '../drawing-tool/pencil/pencil-service'; // use pencil to erase

@Injectable({
    providedIn: 'root',
})
export class EraserService extends PencilService {
    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService);
        this.toolName="Efface"
    }
}
