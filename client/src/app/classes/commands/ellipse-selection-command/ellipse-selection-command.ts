import { Vec2 } from '@app/classes/vec2';
import { EllipseSelectionService } from '@app/services/tools/selection/ellipse-selection.service';

export class EllipseSelectionCommand {
    constructor(
        private ellipseSelectionService: EllipseSelectionService,
        private ctx: CanvasRenderingContext2D,
        private imageData: ImageData,
        private topLeft: Vec2,
        private bottomRight: Vec2,
        private finalTopLeft: Vec2,
        private finalBottomRight: Vec2,
    ) {}

    execute(): void {
        this.ellipseSelectionService.fillWithWhite(this.ctx, this.topLeft, this.bottomRight);
        this.ellipseSelectionService.drawSelectionEllipse(this.ctx, this.imageData, this.finalBottomRight, this.finalTopLeft);
    }
}
