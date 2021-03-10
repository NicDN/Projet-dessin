import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeCommand } from './resize-command/resize-command';

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
