import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/drawing-tool/pencil/pencil-service';

@Injectable({
    providedIn: 'root',
})
export class EraserService extends PencilService {
    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService);
    }

    protected drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        this.thickness = 20; // TO_CHANGE
        ctx = this.drawingService.baseCtx; // TO_CHANGE
        let oldPointX: number = path[0].x;
        let oldPointY: number = path[0].y;
        ctx.globalCompositeOperation = 'destination-out';

        for (const point of path) {
            ctx.beginPath();
            ctx.moveTo(oldPointX, oldPointY);
            ctx.lineWidth = this.thickness;
            ctx.lineTo(point.x, point.y);
            ctx.stroke();

            oldPointX = point.x;
            oldPointY = point.y;
        }

        ctx.globalCompositeOperation = 'source-over';
    }
}
