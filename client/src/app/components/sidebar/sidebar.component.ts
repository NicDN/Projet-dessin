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
    private readonly SHOW_DELAY_MS: number = 750;
    showDelay: FormControl = new FormControl(this.SHOW_DELAY_MS);
    element: HTMLElement;

    // tslint:disable-next-line: no-empty
    constructor(private toolService: ToolsService, private optionService: OptionsService) {}

    sideBarOptions: { icon: string; toolTipContent: string; option?: Option }[] = [
        // { id: 0, icon: 'mouse-pointer', toolTipContent: 'Outils de sélection' },
        { icon: 'pencil-alt', toolTipContent: 'Crayon (C)', option: this.toolService.pencilService },
        // { id: 2, icon: 'spray-can', toolTipContent: 'Aérosol (A)' },
        { icon: 'square', toolTipContent: 'Rectangle (1)', option: this.toolService.rectangleDrawingService },
        { icon: 'circle', toolTipContent: 'Ellipse (2)', option: this.toolService.ellipseDrawingService },
        // { id: 5, icon: 'draw-polygon', toolTipContent: 'Polygone (3)' },
        { icon: 'project-diagram', toolTipContent: 'Ligne (L)', option: this.toolService.lineService },
        // { id: 7, icon: 'font', toolTipContent: 'Texte (T)' },
        // { id: 8, icon: 'fill-drip', toolTipContent: 'Sceau de peinture (B)' },
        { icon: 'eraser', toolTipContent: 'Efface (E)', option: this.toolService.eraserService },
        // { id: 10, icon: 'stamp', toolTipContent: 'Étampe (D)' },
        // { id: 11, icon: 'eye-dropper', toolTipContent: 'Pipette (I)' },
        // { id: 12, icon: 'border-all', toolTipContent: 'Options de zone de travail' },
        { icon: 'plus', toolTipContent: 'Créer un nouveau dessin (Ctrl-O)' },
        // { id: 14, icon: 'folder-open', toolTipContent: 'Voir le carrousel de dessins (Ctrl-G)' },
        // { id: 15, icon: 'save', toolTipContent: 'Sauvegarder le dessin (Ctrl-S)' },
        // { id: 16, icon: 'download', toolTipContent: 'Exporter le dessin (Ctrl-E)' },
    ];

    // tslint:disable-next-line: no-any (TEMPORARY)
    toggleActive(event: any, option: Option): void {
        event.preventDefault();
        if (this.element !== undefined) {
            this.element.style.backgroundColor = 'rgb(33, 38, 43)';
        }
        const target = event.currentTarget;
        target.style.backgroundColor = '#e51282';
        this.element = target;

        // call function to assign current tool
        this.optionService.setActiveOption(option);
    }

    get showDelays(): FormControl {
        return this.showDelay;
    }
}
