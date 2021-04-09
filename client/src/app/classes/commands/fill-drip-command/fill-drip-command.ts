import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { Vec2 } from '@app/classes/vec2';
import { FillDripService } from '@app/services/tools/fill-drip/fill-drip.service';

export interface FillDripProperties {
    ctx: CanvasRenderingContext2D;
    data: ImageData;
    mousePosition: Vec2;
    isContiguous: boolean;
    mainColor: Uint8ClampedArray;
    percentage: number;
    higherLimit: Uint8ClampedArray;
    lowerLimit: Uint8ClampedArray;
}

export class FillDripCommand extends AbstractCommand {
    constructor(private fillDripService: FillDripService, private fillDripProperties: FillDripProperties) {
        super();
    }

    execute(): void {
        if (this.fillDripProperties.isContiguous) {
            this.fillDripService.contiguousFilling(this.fillDripProperties);
        } else {
            this.fillDripService.nonContiguousFilling(this.fillDripProperties);
        }
    }
}
