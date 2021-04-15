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
    toolBarElements: ToolBarElement[] = [];

    constructor(public toolService: ToolsService) {
        this.toolService.setCurrentTool(this.toolService.pencilService);
        this.initializeToolBarElements();
    }

    private initializeToolBarElements(): void {
        this.toolBarElements = [
            { icon: 'pencil-alt', toolTipContent: 'Crayon (C)', tool: this.toolService.pencilService },
            { icon: 'eraser', toolTipContent: 'Efface (E)', tool: this.toolService.eraserService },
            { icon: 'square', toolTipContent: 'Rectangle (1)', tool: this.toolService.rectangleDrawingService },
            { icon: 'circle', toolTipContent: 'Ellipse (2)', tool: this.toolService.ellipseDrawingService },
            { icon: 'dice-d20', toolTipContent: 'Polygone (3)', tool: this.toolService.polygonService },
            { icon: 'project-diagram', toolTipContent: 'Ligne (L)', tool: this.toolService.lineService },
            { icon: 'spray-can', toolTipContent: 'Aérosol (A)', tool: this.toolService.sprayCanService },
            { icon: 'eye-dropper', toolTipContent: 'Pipette (I)', tool: this.toolService.eyeDropperService },
            {
                toolTipContent: 'Sélection (R : Rectangle, S : Ellipse, V: Lasso)',
                icon: 'expand',
                tool: this.toolService.selectedSelectionService,
            },
            { icon: 'fill-drip', toolTipContent: 'Sceau de peinture (B)', tool: this.toolService.fillDripService },
            { icon: 'font', toolTipContent: 'Texte (T)', tool: this.toolService.textService },
            { icon: 'stamp', toolTipContent: 'Étampe (D)', tool: this.toolService.stampService },
            { icon: 'border-all', toolTipContent: 'Options de grille', tool: this.toolService.gridService },
        ];
    }

    toggleActive(tool: Tool): void {
        this.toolService.setCurrentTool(tool);
        this.initializeToolBarElements();
    }

    checkActiveTool(tool: Tool): boolean {
        if (tool instanceof SelectionTool) {
            return (
                this.toolService.currentTool === this.toolService.rectangleSelectionService ||
                this.toolService.currentTool === this.toolService.ellipseSelectionService ||
                this.toolService.currentTool === this.toolService.lassoSelectionService
            );
        }
        return tool === this.toolService.currentTool;
    }
}
