import { Component } from '@angular/core';
import { SelectionTool } from '@app/classes/selection-tool';
import { Tool } from '@app/classes/tool';
import { ToolsService } from '@app/services/tools/tools.service';

interface SelectionBarElement {
    icon: string;
    iconFamily: string;
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
        {
            iconFamily: 'far',
            icon: 'square',
            selectionTipContent: 'Sélection par rectangle (R)',
            selectionService: this.toolsService.rectangleSelectionService,
        },
        {
            iconFamily: 'far',
            icon: 'circle',
            selectionTipContent: 'Sélection par ellipse (S)',
            selectionService: this.toolsService.ellipseSelectionService,
        },
        {
            iconFamily: 'fas',
            icon: 'draw-polygon',
            selectionTipContent: 'Sélection par lasso polygonal (V)',
            selectionService: this.toolsService.lassoSelectionService,
        },
    ];

    constructor(public toolsService: ToolsService) {}

    toggleActive(tool: SelectionTool): void {
        this.toolsService.setCurrentTool(tool);
    }
}
