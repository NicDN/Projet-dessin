import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Tool } from '@app/classes/tool';
import { ToolsService } from '@app/services/tools/tools.service';

@Component({
    selector: 'app-tool-bar',
    templateUrl: './tool-bar.component.html',
    styleUrls: ['./tool-bar.component.scss'],
})
export class ToolBarComponent implements OnInit {
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
    constructor(private toolService: ToolsService) {}

    ngOnInit(): void {}

    // tslint:disable-next-line: no-any (TEMPORARY)
    toggleActive(event: any, tool: Tool): void {
        this.applyBtnStyle(event);
        this.toolService.setCurrentTool(tool);
    }

    //tslint:disable-next-line: no-any
    // faire avec ngStyle
    applyBtnStyle(event: any): void {
        if (this.element !== undefined) {
            this.element.style.backgroundColor = 'rgb(33, 38, 43)';
        }
        const target = event.currentTarget;
        target.style.backgroundColor = '#e51282';
        this.element = target;
    }
}
