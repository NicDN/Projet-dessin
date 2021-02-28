import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { AbstractCommand } from './abstract-command';
export class EraserCommand extends AbstractCommand {
    drawingContext: CanvasRenderingContext2D;
    drawingPath: Vec2[];
    drawingThickness: number;
    drawingColor: string;
    drawingGlobalAlpha: number;
    drawingService: DrawingService;
    eraserService: EraserService;

    constructor(
        ctx: CanvasRenderingContext2D,
        path: Vec2[],
        thickness: number,
        color: string,
        globalAlpha: number,
        drawingService: DrawingService,
        eraserService: EraserService,
    ) {
        super();
        this.drawingContext = ctx;
        this.drawingPath = path;
        this.drawingThickness = thickness;
        this.drawingColor = color;
        this.drawingGlobalAlpha = globalAlpha;
        this.drawingService = drawingService;
        this.eraserService = eraserService;
    }
    execute(): void {
        // Execute drawLine
        this.drawingContext = this.drawingService.baseCtx;
        this.eraserService.verifThickness(this.drawingContext, this.drawingThickness);

        if (this.eraserService.singleClick(this.drawingPath)) {
            this.eraserService.eraseSquare(this.drawingContext, { x: this.drawingPath[0].x, y: this.drawingPath[0].y });
            return;
        }

        let oldPointX: number = this.drawingPath[0].x;
        let oldPointY: number = this.drawingPath[0].y;

        for (const point of this.drawingPath) {
            const dist = this.eraserService.distanceBetween({ x: oldPointX, y: oldPointY }, { x: point.x, y: point.y });
            const angle = this.eraserService.distanceBetween({ x: oldPointX, y: oldPointY }, { x: point.x, y: point.y });

            for (let i = 0; i < dist; i += 1) {
                const xValue = oldPointX + Math.sin(angle) * i;
                const yValue = oldPointY + Math.cos(angle) * i;
                this.eraserService.eraseSquare(this.drawingContext, { x: xValue, y: yValue });
            }

            oldPointX = point.x;
            oldPointY = point.y;
        }
    }
}
