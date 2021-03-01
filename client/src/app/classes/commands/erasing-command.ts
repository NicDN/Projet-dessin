import { Vec2 } from '@app/classes/vec2';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { AbstractCommand } from './abstract-command';
export class EraserCommand extends AbstractCommand {
    drawingContext: CanvasRenderingContext2D;
    drawingPath: Vec2[];
    drawingThickness: number;
    drawingColor: string;
    drawingGlobalAlpha: number;

    constructor(ctx: CanvasRenderingContext2D, path: Vec2[], thickness: number, private eraserService: EraserService) {
        super();
        this.drawingContext = ctx;
        this.drawingPath = path;
        this.drawingThickness = thickness;
    }
    execute(): void {
        // Execute drawLine
        if (this.eraserService.singleClick(this.drawingPath)) {
            this.eraserService.eraseSquare(this.drawingContext, { x: this.drawingPath[0].x, y: this.drawingPath[0].y }, this.drawingThickness);
            return;
        }

        let oldPointX: number = this.drawingPath[0].x;
        let oldPointY: number = this.drawingPath[0].y;

        for (const point of this.drawingPath) {
            const dist = this.eraserService.distanceBetween({ x: oldPointX, y: oldPointY }, { x: point.x, y: point.y });
            console.log(dist);
            const angle = this.eraserService.angleBetween({ x: oldPointX, y: oldPointY }, { x: point.x, y: point.y });
            console.log(angle);
            for (let i = 0; i < dist; i += 1) {
                const xValue = oldPointX + Math.sin(angle) * i;
                const yValue = oldPointY + Math.cos(angle) * i;
                this.eraserService.eraseSquare(this.drawingContext, { x: xValue, y: yValue }, this.drawingThickness);
            }

            oldPointX = point.x;
            oldPointY = point.y;
        }
    }
}
