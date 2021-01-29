import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Option } from '@app/classes/option';
import { OptionsService } from '@app/services/options.service';
import { ToolsService } from '@app/services/tools/tools.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    readonly SHOW_DELAY_MS: number = 750;
    showDelay: FormControl = new FormControl(this.SHOW_DELAY_MS);
    element: HTMLElement;

    constructor(private toolService: ToolsService, private optionService: OptionsService) {}

    sideBarOptions: { icon: string; toolTipContent: string; option?: Option }[] = [
        { icon: 'pencil-alt', toolTipContent: 'Crayon (C)', option: this.toolService.pencilService },
        { icon: 'square', toolTipContent: 'Rectangle (1)', option: this.toolService.rectangleDrawingService },
        { icon: 'circle', toolTipContent: 'Ellipse (2)', option: this.toolService.ellipseDrawingService },
        { icon: 'project-diagram', toolTipContent: 'Ligne (L)', option: this.toolService.lineService },
        { icon: 'eraser', toolTipContent: 'Efface (E)', option: this.toolService.eraserService },
        { icon: 'plus', toolTipContent: 'Créer un nouveau dessin (Ctrl-O)' },
    ];

    // tslint:disable-next-line: no-any (TEMPORARY)
    toggleActive(event: any, option: Option): void {
        this.applyBtnStyle(event);
        this.optionService.setActiveOption(option);
    }

    // tslint:disable-next-line: no-any
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
