import { Component } from '@angular/core';
import { SelectionTool } from '@app/classes/selection-tool';
import { Tool } from '@app/classes/tool';
import { ToolsService } from '@app/services/tools/tools.service';

interface ToolBarElement {
    icon: string;
    toolTipContent: string;
    tool: Tool;
    hovered: boolean;
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
            { icon: 'pencil-alt', toolTipContent: 'Crayon (C)', tool: this.toolService.pencilService, hovered: false },
            { icon: 'eraser', toolTipContent: 'Efface (E)', tool: this.toolService.eraserService, hovered: false },
            { icon: 'square', toolTipContent: 'Rectangle (1)', tool: this.toolService.rectangleDrawingService, hovered: false },
            { icon: 'circle', toolTipContent: 'Ellipse (2)', tool: this.toolService.ellipseDrawingService, hovered: false },
            { icon: 'dice-d20', toolTipContent: 'Polygone (3)', tool: this.toolService.polygonService, hovered: false },
            { icon: 'project-diagram', toolTipContent: 'Ligne (L)', tool: this.toolService.lineService, hovered: false },
            { icon: 'spray-can', toolTipContent: 'Aérosol (A)', tool: this.toolService.sprayCanService, hovered: false },
            { icon: 'eye-dropper', toolTipContent: 'Pipette (I)', tool: this.toolService.eyeDropperService, hovered: false },
            {
                toolTipContent: 'Sélection (R : Rectangle, S : Ellipse, V: Lasso)',
                icon: 'expand',
                tool: this.toolService.selectedSelectionService,
                hovered: false,
            },
            { icon: 'fill-drip', toolTipContent: 'Sceau de peinture (B)', tool: this.toolService.fillDripService, hovered: false },
            { icon: 'font', toolTipContent: 'Texte (T)', tool: this.toolService.textService, hovered: false },
            { icon: 'stamp', toolTipContent: 'Étampe (D)', tool: this.toolService.stampService, hovered: false },
            { icon: 'border-all', toolTipContent: 'Options de grille', tool: this.toolService.gridService, hovered: false },
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
