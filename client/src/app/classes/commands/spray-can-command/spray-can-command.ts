import { Color } from '@app/classes/color';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { Vec2 } from '@app/classes/vec2';
import { SprayCanService } from '@app/services/tools/spray-can/spray-can.service';

export interface SprayCanPropreties {
    drawingCtx: CanvasRenderingContext2D;
    drawingPath: Vec2[];
    mainColor: Color;
    dropletsDiameter: number;
    sprayDiameter: number;
    emissionRate: number;
    angleArray: number[];
    radiusArray: number[];
    randomGlobalAlpha: number[];
    randomArc: number[];
}

export class SprayCanCommand extends AbstractCommand {
    constructor(private sprayCanService: SprayCanService, private sprayCanProprieties: SprayCanPropreties) {
        super();
    }
    execute(): void {
        for (const path of this.sprayCanProprieties.drawingPath) {
            this.sprayCanService.sprayOnCanvas(this.sprayCanProprieties, path, true);
        }
    }

    executeNotUndoRedo(): void {
        this.sprayCanService.sprayOnCanvas(
            this.sprayCanProprieties,
            this.sprayCanProprieties.drawingPath[this.sprayCanProprieties.drawingPath.length - 1],
            false,
        );
    }
}
