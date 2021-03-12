import { Component } from '@angular/core';
import { SelectionTool } from '@app/classes/selection-tool';
import { Tool } from '@app/classes/tool';
import { ToolsService } from '@app/services/tools/tools.service';

interface ToolBarElement {
    icon: string;
    toolTipContent: string;
    tool: Tool;
}
@Component({
    selector: 'app-tool-bar',
    templateUrl: './tool-bar.component.html',
    styleUrls: ['./tool-bar.component.scss'],
})
export class ToolBarComponent {
    toolBarElements: ToolBarElement[] = [
        { icon: 'pencil-alt', toolTipContent: 'Crayon (C)', tool: this.toolService.pencilService },
        { icon: 'eraser', toolTipContent: 'Efface (E)', tool: this.toolService.eraserService },
        { icon: 'square', toolTipContent: 'Rectangle (1)', tool: this.toolService.rectangleDrawingService },
        { icon: 'circle', toolTipContent: 'Ellipse (2)', tool: this.toolService.ellipseDrawingService },
        { icon: 'dice-d20', toolTipContent: 'Polygone (3)', tool: this.toolService.polygonService },
        { icon: 'project-diagram', toolTipContent: 'Ligne (L)', tool: this.toolService.lineService },
        { icon: 'spray-can', toolTipContent: 'Aérosol (A)', tool: this.toolService.sprayCanService },
        { icon: 'eye-dropper', toolTipContent: 'Pipette (I)', tool: this.toolService.eyeDropperService },
        {
            icon: 'expand',
            toolTipContent: 'Sélection (R : Rectangle, S : Ellipse)',
            tool: this.toolService.rectangleSelectionService,
        },
    ];
    constructor(public toolService: ToolsService) {
        this.toolService.setCurrentTool(this.toolService.pencilService);
    }

    toggleActive(tool: Tool): void {
        this.toolService.setCurrentTool(tool);
    }

    checkActiveTool(tool: Tool): boolean {
        if (tool instanceof SelectionTool) {
            return (
                this.toolService.currentTool === this.toolService.rectangleSelectionService ||
                this.toolService.currentTool === this.toolService.ellipseSelectionService
            );
        }
        return tool === this.toolService.currentTool;
    }
}
