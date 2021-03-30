import { Component } from '@angular/core';
import { SelectionTool } from '@app/classes/selection-tool';
import { ClipboardSelectionService } from '@app/services/clipboard-selection/clipboard-selection.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle/rectangle-selection.service';
import { ToolsService } from '@app/services/tools/tools.service';

@Component({
    selector: 'app-selection-options',
    templateUrl: './selection-options.component.html',
    styleUrls: ['./selection-options.component.scss'],
})
export class SelectionOptionsComponent {
    constructor(
        private clipboardSelectionService: ClipboardSelectionService,
        private rectangleSelectionService: RectangleSelectionService,
        private toolsService: ToolsService,
    ) {}

    selectionIsActive(): boolean {
        return (this.toolsService.currentTool as SelectionTool).selectionExists;
    }

    canPaste(): boolean {
        return this.clipboardSelectionService.clipBoardData !== undefined;
    }

    selectAll(): void {
        this.toolsService.setCurrentTool(this.toolsService.rectangleSelectionService);
        this.rectangleSelectionService.selectAll();
    }
}
