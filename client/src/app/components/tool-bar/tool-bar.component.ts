import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Tool } from '@app/classes/tool';
import { ToolsService } from '@app/services/tools/tools.service';
@Component({
    selector: 'app-tool-bar',
    templateUrl: './tool-bar.component.html',
    styleUrls: ['./tool-bar.component.scss'],
})
export class ToolBarComponent {
    readonly SHOW_DELAY_MS: number = 750;
    showDelay: FormControl = new FormControl(this.SHOW_DELAY_MS);
    element: HTMLElement;

    toolBarElements: { icon: string; toolTipContent: string; tool?: Tool }[] = [
        { icon: 'pencil-alt', toolTipContent: 'Crayon (C)', tool: this.toolService.pencilService },
        { icon: 'square', toolTipContent: 'Rectangle (1)', tool: this.toolService.rectangleDrawingService },
        { icon: 'circle', toolTipContent: 'Ellipse (2)', tool: this.toolService.ellipseDrawingService },
        { icon: 'project-diagram', toolTipContent: 'Ligne (L)', tool: this.toolService.lineService },
        { icon: 'eraser', toolTipContent: 'Efface (E)', tool: this.toolService.eraserService },
    ];
    constructor(public toolService: ToolsService) {
        this.toolService.setCurrentTool(this.toolService.pencilService);
    }

    toggleActive(tool: Tool): void {
        this.toolService.setCurrentTool(tool);
    }
}
