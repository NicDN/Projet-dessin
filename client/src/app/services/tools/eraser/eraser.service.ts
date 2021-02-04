import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/drawing-tool/pencil/pencil-service';

const MINTHICKNESS = 5;

@Injectable({
    providedIn: 'root',
})
export class EraserService extends PencilService {
    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService);
        this.thickness = MINTHICKNESS;
    }

    protected drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx = this.drawingService.baseCtx; // TO_CHANGE
        let oldPointX: number = path[0].x;
        let oldPointY: number = path[0].y;
        ctx.globalCompositeOperation = 'destination-out';
        if (this.thickness < MINTHICKNESS) this.thickness = MINTHICKNESS;
        ctx.lineWidth = this.thickness;

        for (const point of path) {
            ctx.beginPath();
            ctx.moveTo(oldPointX, oldPointY);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            oldPointX = point.x;
            oldPointY = point.y;
        }

        ctx.globalCompositeOperation = 'source-over';
    }
}
