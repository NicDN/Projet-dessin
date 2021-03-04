import { Vec2 } from '@app/classes/vec2';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { AbstractCommand } from '../abstract-command';

export interface EraserPropreties {
    drawingContext: CanvasRenderingContext2D;
    drawingPath: Vec2[];
    drawingThickness: number;
}

export class EraserCommand extends AbstractCommand {
    constructor(private eraserService: EraserService, private eraserPropreties: EraserPropreties) {
        super();
    }
    execute(): void {
        this.eraserService.executeErase(this.eraserPropreties);
    }
}
