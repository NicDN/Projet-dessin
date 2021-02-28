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
    //     // Execute drawLine
    //     ctx.globalAlpha = this.colorService.mainColor.opacity;
    //     ctx.strokeStyle = this.colorService.mainColor.rgbValue;
    //     ctx.fillStyle = this.colorService.mainColor.rgbValue;
    //     ctx.lineJoin = ctx.lineCap = 'round';
    //     ctx.beginPath();

    //     for (const point of path) {
    //         ctx.lineWidth = this.thickness;
    //         ctx.lineTo(point.x, point.y);
    //         if (this.drawWithJunction) {
    //             const circle = new Path2D();
    //             circle.arc(point.x, point.y, this.junctionDiameter, 0, 2 * Math.PI);
    //             ctx.fill(circle);
    //         }
    //     }
    //     ctx.stroke();
    // }
    // private setContext(ctx: CanvasRenderingContext2D): void {
    //     ctx.lineJoin = ctx.lineCap = 'round';
    //     ctx.lineWidth = this.drawingThickness;
    //     ctx.globalAlpha = this.drawingGlobalAlpha;
    //     ctx.strokeStyle = this.drawingColor;
    }
}
