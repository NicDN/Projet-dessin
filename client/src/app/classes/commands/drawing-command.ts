import { Vec2 } from '@app/classes/vec2';
import { AbstractCommand } from './abstract-command';
export class DrawingCommand extends AbstractCommand {

    drawingContext: CanvasRenderingContext2D;
    drawingPath: Vec2[];
    drawingThickness: number;
    drawingColor: string;
    drawingGlobalAlpha: number;

    constructor(ctx: CanvasRenderingContext2D, path: Vec2[], thickness: number, color: string, globalAlpha: number) {
        super();
        this.drawingContext = ctx;
        this.drawingPath = path;
        this.drawingThickness = thickness;
        this.drawingColor = color;
        this.drawingGlobalAlpha = globalAlpha;
    }
    execute(): void {
        // Execute drawLine
        this.drawingContext.save();
        this.setContext(this.drawingContext);
        let oldPointX: number = this.drawingPath[0].x;
        let oldPointY: number = this.drawingPath[0].y;

        this.drawingContext.beginPath();
        for (const point of this.drawingPath) {
            this.drawingContext.moveTo(oldPointX, oldPointY);
            this.drawingContext.lineTo(point.x, point.y);

            oldPointX = point.x;
            oldPointY = point.y;
        }
        this.drawingContext.stroke();
        this.drawingContext.restore();
    }
    private setContext(ctx: CanvasRenderingContext2D): void {
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.lineWidth = this.drawingThickness;
        ctx.globalAlpha = this.drawingGlobalAlpha;
        ctx.strokeStyle = this.drawingColor;
    }
}
