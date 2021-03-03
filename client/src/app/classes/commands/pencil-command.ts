import { Vec2 } from '@app/classes/vec2';
import { Color } from '@app/classes/color';
import { AbstractCommand } from './abstract-command';

export interface PencilPropreties {
    drawingContext: CanvasRenderingContext2D;
    drawingPath: Vec2[];
    drawingThickness: number;
    drawingColor: Color;
}

export class PencilCommand extends AbstractCommand {
    constructor(private pencilPropreties: PencilPropreties) {
        super();
    }
    execute(): void {
        // Execute drawLine
        this.pencilPropreties.drawingContext.save();
        this.setContext(this.pencilPropreties.drawingContext);
        let oldPointX: number = this.pencilPropreties.drawingPath[0].x;
        let oldPointY: number = this.pencilPropreties.drawingPath[0].y;

        this.pencilPropreties.drawingContext.beginPath();
        for (const point of this.pencilPropreties.drawingPath) {
            this.pencilPropreties.drawingContext.moveTo(oldPointX, oldPointY);
            this.pencilPropreties.drawingContext.lineTo(point.x, point.y);

            oldPointX = point.x;
            oldPointY = point.y;
        }
        this.pencilPropreties.drawingContext.stroke();
        this.pencilPropreties.drawingContext.restore();
    }
    private setContext(ctx: CanvasRenderingContext2D): void {
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.lineWidth = this.pencilPropreties.drawingThickness;
        ctx.globalAlpha = this.pencilPropreties.drawingColor.opacity;
        ctx.strokeStyle = this.pencilPropreties.drawingColor.rgbValue;
    }
}
