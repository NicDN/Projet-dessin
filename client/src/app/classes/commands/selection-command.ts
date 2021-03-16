import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { SelectionTool } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { EllipseSelectionService } from '@app/services/tools/selection/ellipse-selection.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle-selection.service';

export class SelectionCommand extends AbstractCommand {
    constructor(
        private selectionTool: SelectionTool,
        private ctx: CanvasRenderingContext2D,
        private imageData: ImageData,
        private topLeft: Vec2,
        private bottomRight: Vec2,
        private finalTopLeft: Vec2,
        private finalBottomRight?: Vec2,
    ) {
        super();
    }

    execute(): void {
        if (this.selectionTool instanceof RectangleSelectionService) {
            (this.selectionTool as RectangleSelectionService).fillWithWhite(this.ctx, this.topLeft, this.bottomRight);
            (this.selectionTool as RectangleSelectionService).drawSelectionRectangle(this.ctx, this.finalTopLeft, this.imageData);
        }
        if (this.selectionTool instanceof EllipseSelectionService) {
            if (this.finalBottomRight === undefined) return;
            (this.selectionTool as EllipseSelectionService).fillWithWhite(this.ctx, this.topLeft, this.bottomRight);
            (this.selectionTool as EllipseSelectionService).drawSelectionEllipse(this.ctx, this.imageData, this.finalBottomRight, this.finalTopLeft);
        }
    }
}
