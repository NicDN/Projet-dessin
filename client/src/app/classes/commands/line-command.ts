import { Vec2 } from '@app/classes/vec2';
import { Color } from '../color';
import { AbstractCommand } from './abstract-command';

export interface LinePropreties {
    drawingContext: CanvasRenderingContext2D;
    drawingPath: Vec2[];
    drawingThickness: number;
    drawingColor: Color;
    drawWithJunction: boolean;
    junctionDiameter: number;
}

export class LineCommand extends AbstractCommand {
    constructor(private linePropreties: LinePropreties) {
        super();
    }
    execute(): void {
        this.setContext(this.linePropreties.drawingContext);
        this.linePropreties.drawingContext.beginPath();

        for (const point of this.linePropreties.drawingPath) {
            this.linePropreties.drawingContext.lineWidth = this.linePropreties.drawingThickness;
            this.linePropreties.drawingContext.lineTo(point.x, point.y);
            if (this.linePropreties.drawWithJunction) {
                const circle = new Path2D();
                circle.arc(point.x, point.y, this.linePropreties.junctionDiameter, 0, 2 * Math.PI);
                this.linePropreties.drawingContext.fill(circle);
            }
        }
        this.linePropreties.drawingContext.stroke();
    }

    private setContext(ctx: CanvasRenderingContext2D): void {
        ctx.globalAlpha = this.linePropreties.drawingColor.opacity;
        ctx.strokeStyle = this.linePropreties.drawingColor.rgbValue;
        ctx.fillStyle = this.linePropreties.drawingColor.rgbValue;
        ctx.lineJoin = this.linePropreties.drawingContext.lineCap = 'round';
    }
}
