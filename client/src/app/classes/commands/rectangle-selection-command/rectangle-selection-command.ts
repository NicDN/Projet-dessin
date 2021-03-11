import { Vec2 } from '@app/classes/vec2';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle-selection.service';

export class RectangleSelectionCommand {
    constructor(
        private rectangleSelectionService: RectangleSelectionService,
        private ctx: CanvasRenderingContext2D,
        private imageData: ImageData,
        private finalTopLeft: Vec2,
        private topLeft: Vec2,
        private bottomRight: Vec2,
    ) {}

    execute(): void {
        this.rectangleSelectionService.fillWithWhite(this.ctx, this.topLeft, this.bottomRight);
        this.rectangleSelectionService.drawSelectionRectangle(this.ctx, this.finalTopLeft, this.imageData);
    }
}
