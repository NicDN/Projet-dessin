import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { AbstractCommand } from './abstract-command';

export interface PencilPropreties {
    drawingContext: CanvasRenderingContext2D;
    drawingPath: Vec2[];
    drawingThickness: number;
    drawingColor: Color;
}

export class PencilCommand extends AbstractCommand {
    constructor(private pencilService: PencilService, private pencilPropreties: PencilPropreties) {
        super();
    }
    execute(): void {
        this.pencilPropreties.drawingContext.save();
        this.setContext(this.pencilPropreties.drawingContext);
        this.pencilService.executeDrawLine(this.pencilPropreties);
        this.pencilPropreties.drawingContext.restore();
    }
    private setContext(ctx: CanvasRenderingContext2D): void {
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.lineWidth = this.pencilPropreties.drawingThickness;
        ctx.globalAlpha = this.pencilPropreties.drawingColor.opacity;
        ctx.strokeStyle = this.pencilPropreties.drawingColor.rgbValue;
    }
}
