import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { SelectionTool } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';

export enum SelectionType {
    Rectangle = 1,
    Ellipse = 2,
}

export interface SelectionPropreties {
    selectionCtx?: CanvasRenderingContext2D;
    imageData: ImageData;
    topLeft: Vec2;
    bottomRight: Vec2;
    finalTopLeft: Vec2;
    finalBottomRight: Vec2;
}

export class SelectionCommand extends AbstractCommand {
    constructor(private selectionPropreties: SelectionPropreties, private selectionTool: SelectionTool) {
        super();
    }

    execute(): void {
        this.selectionTool.fillWithWhite(this.selectionPropreties);
        this.selectionTool.drawSelection(this.selectionPropreties);
    }
}
