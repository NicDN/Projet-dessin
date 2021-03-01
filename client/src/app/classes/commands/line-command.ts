import { Vec2 } from '@app/classes/vec2';
import { AbstractCommand } from './abstract-command';
export class LineCommand extends AbstractCommand {
    drawingContext: CanvasRenderingContext2D;
    drawingPath: Vec2[];
    drawingThickness: number;
    drawingColor: string;
    drawingGlobalAlpha: number;
    drawWithJunction: boolean;
    junctionDiameter: number;

    constructor(
        ctx: CanvasRenderingContext2D,
        path: Vec2[],
        thickness: number,
        color: string,
        globalAlpha: number,
        drawWithJunction: boolean,
        junctionDiameter: number,
    ) {
        super();
        this.drawingContext = ctx;
        this.drawingPath = path;
        this.drawingThickness = thickness;
        this.drawingColor = color;
        this.drawingGlobalAlpha = globalAlpha;
        this.drawWithJunction = drawWithJunction;
        this.junctionDiameter = junctionDiameter;
    }
    execute(): void {
        this.setContext(this.drawingContext);
        this.drawingContext.beginPath();

        for (const point of this.drawingPath) {
            this.drawingContext.lineWidth = this.drawingThickness;
            this.drawingContext.lineTo(point.x, point.y);
            if (this.drawWithJunction) {
                const circle = new Path2D();
                circle.arc(point.x, point.y, this.junctionDiameter, 0, 2 * Math.PI);
                this.drawingContext.fill(circle);
            }
        }
        this.drawingContext.stroke();
    }

    private setContext(ctx: CanvasRenderingContext2D): void {
        ctx.globalAlpha = this.drawingGlobalAlpha;
        ctx.strokeStyle = this.drawingColor;
        ctx.fillStyle = this.drawingColor;
        ctx.lineJoin = this.drawingContext.lineCap = 'round';
    }
}
