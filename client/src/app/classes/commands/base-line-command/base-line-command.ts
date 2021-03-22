import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { ResizeCommand } from '@app/classes/commands/resize-command/resize-command';
import { DrawingService } from '@app/services/drawing/drawing.service';

export class BaseLineCommand extends AbstractCommand {
    constructor(private drawingService: DrawingService, private image: HTMLImageElement) {
        super();
    }

    execute(): void {
        const resizeCommand = new ResizeCommand({ widthBox: this.image.width, heightBox: this.image.height }, this.drawingService);
        resizeCommand.execute();
        this.drawingService.executeBaseLine(this.image);
    }
}
