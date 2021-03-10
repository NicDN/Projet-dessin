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
    randomStoring?: RandomStoring;
}

export interface RandomStoring {
    angleArray: number[][];
    radiusArray: number[][];
    randomGlobalAlpha: number[][];
    randomArc: number[][];
}

export class SprayCanCommand extends AbstractCommand {
    constructor(private sprayCanService: SprayCanService, private sprayCanProprieties: SprayCanPropreties) {
        super();
    }
    execute(): void {
        let i = 0;
        for (const path of this.sprayCanProprieties.drawingPath) {
            if (this.sprayCanProprieties.randomStoring !== undefined) {
                this.sprayCanProprieties.angleArray = this.sprayCanProprieties.randomStoring.angleArray[i];
                this.sprayCanProprieties.radiusArray = this.sprayCanProprieties.randomStoring.radiusArray[i];
                this.sprayCanProprieties.randomGlobalAlpha = this.sprayCanProprieties.randomStoring.randomGlobalAlpha[i];
                this.sprayCanProprieties.randomArc = this.sprayCanProprieties.randomStoring.randomArc[i];
                this.sprayCanService.sprayOnCanvas(this.sprayCanProprieties, path, true);
                i++;
            }
        }
    }

    setRandomStoring(randomStoring: RandomStoring): void {
        this.sprayCanProprieties.randomStoring = randomStoring;
    }

    executeNotUndoRedo(): void {
        this.sprayCanService.sprayOnCanvas(
            this.sprayCanProprieties,
            this.sprayCanProprieties.drawingPath[this.sprayCanProprieties.drawingPath.length - 1],
            false,
        );
    }
}
