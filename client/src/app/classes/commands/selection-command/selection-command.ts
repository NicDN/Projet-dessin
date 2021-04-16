import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { SelectionCoords, SelectionTool } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';

export enum SelectionType {
    Rectangle = 1,
    Ellipse = 2,
    Lasso = 3,
    None = 4,
}

export interface SelectionProperties {
    selectionCtx?: CanvasRenderingContext2D;
    selectionPathData?: Vec2[];
    firstPointOffset?: Vec2;
    imageData: ImageData;
    coords: SelectionCoords;
}

export class SelectionCommand extends AbstractCommand {
    constructor(private selectionPropreties: SelectionProperties, private selectionTool: SelectionTool) {
        super();
    }

    execute(): void {
        this.selectionTool.fillWithWhite(this.selectionPropreties);
        this.selectionTool.drawSelection(this.selectionPropreties);
    }
}
