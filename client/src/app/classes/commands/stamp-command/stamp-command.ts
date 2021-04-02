import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { Vec2 } from '@app/classes/vec2';
import { StampService } from '@app/services/tools/stamp/stamp.service';

export interface StampPropreties {
    drawingContext: CanvasRenderingContext2D;
    currentCoords: Vec2;
    selectedStampSrc: string;
    angle: number;
    scaling: number;
}

export class StampCommand extends AbstractCommand {
    constructor(private stampService: StampService, private stampPropreties: StampPropreties) {
        super();
    }

    execute(): void {
        this.stampService.drawImageOnCanvas(this.stampPropreties);
    }
}
