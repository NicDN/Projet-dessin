import { Vec2 } from '@app/classes/vec2';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { AbstractCommand } from './abstract-command';


export interface EraserPropreties {
    drawingContext: CanvasRenderingContext2D;
    drawingPath: Vec2[];
    drawingThickness: number;
    drawingColor: string;
    drawingGlobalAlpha: number;
}

export class EraserCommand extends AbstractCommand {
    constructor(private eraserService: EraserService, private eraserPropreties: EraserPropreties) {
        super();
    }
    execute(): void {
        // Execute drawLine
        if (this.eraserService.singleClick(this.eraserPropreties.drawingPath)) {
            this.eraserService.eraseSquare(
                this.eraserPropreties.drawingContext,
                { x: this.eraserPropreties.drawingPath[0].x, y: this.eraserPropreties.drawingPath[0].y },
                this.eraserPropreties.drawingThickness,
            );
            return;
        }

        let oldPointX: number = this.eraserPropreties.drawingPath[0].x;
        let oldPointY: number = this.eraserPropreties.drawingPath[0].y;

        for (const point of this.eraserPropreties.drawingPath) {
            const dist = this.eraserService.distanceBetween({ x: oldPointX, y: oldPointY }, { x: point.x, y: point.y });
            console.log(dist);
            const angle = this.eraserService.angleBetween({ x: oldPointX, y: oldPointY }, { x: point.x, y: point.y });
            console.log(angle);
            for (let i = 0; i < dist; i += 1) {
                const xValue = oldPointX + Math.sin(angle) * i;
                const yValue = oldPointY + Math.cos(angle) * i;
                this.eraserService.eraseSquare(
                    this.eraserPropreties.drawingContext,
                    { x: xValue, y: yValue },
                    this.eraserPropreties.drawingThickness,
                );
            }

            oldPointX = point.x;
            oldPointY = point.y;
        }
    }
}
