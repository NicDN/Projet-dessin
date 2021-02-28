import { DrawingService } from '@app/services/drawing/drawing.service';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { BoxSize } from '@app/classes/box-size';

export class ResizeCommand extends AbstractCommand {
    resizeBoxSize: BoxSize;
    constructor(boxSize: BoxSize, private drawingService: DrawingService) {
        super();
        this.resizeBoxSize = boxSize;
    }
    execute(): void {
        this.drawingService.sendNotifToResize(this.resizeBoxSize);
    }
}
