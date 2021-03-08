import { Color } from '@app/classes/color';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { Vec2 } from '@app/classes/vec2';
import { SprayCanService } from '@app/services/tools/spray-can/spray-can.service';

interface SprayCanPropreties {
    drawingCtx: CanvasRenderingContext2D;
    drawingPath: Vec2[];
    mainColor: Color;
    dropletsDiameter: number;
    sprayDiameter: number;
    emissionRate: number;
}

export class SprayCanCommand extends AbstractCommand {
    constructor(private sprayCanService: SprayCanService, private sprayCanProprieties: SprayCanPropreties) {
        super();
    }
    execute(): void {
        this.sprayCanService.sprayOnCanvas(this.sprayCanProprieties);
    }
}
