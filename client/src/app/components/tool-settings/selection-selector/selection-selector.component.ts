import { Component } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { ToolsService } from '@app/services/tools/tools.service';
interface SelectionBarElement {
    icon: string;
    selectionTipContent: string;
    selectionService: Tool;
}

@Component({
    selector: 'app-selection-selector',
    templateUrl: './selection-selector.component.html',
    styleUrls: ['./selection-selector.component.scss'],
})
export class SelectionSelectorComponent {
    selectionElements: SelectionBarElement[] = [
        { icon: 'square', selectionTipContent: 'rectangle selecting (tbd)', selectionService: this.toolsService.rectangleSelectionService },
        { icon: 'circle', selectionTipContent: 'ellipse selecting (tbd', selectionService: this.toolsService.ellipseSelectionService },
    ];

    constructor(public toolsService: ToolsService) {}

    toggleActive(tool: Tool): void {
        this.toolsService.setCurrentTool(tool);
    }
}
