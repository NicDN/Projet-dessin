import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    private readonly SHOW_DELAY_MS: number = 750;
    showDelay: FormControl = new FormControl(this.SHOW_DELAY_MS);
    element: HTMLElement;

    sideBarOptions: { id: number; icon: string; toolTipContent: string }[] = [
        { id: 0, icon: 'mouse-pointer', toolTipContent: 'Outils de sélection' },
        { id: 1, icon: 'pencil-alt', toolTipContent: 'Crayon (C)' },
        { id: 2, icon: 'spray-can', toolTipContent: 'Aérosol (A)' },
        { id: 3, icon: 'square', toolTipContent: 'Rectangle (1)' },
        { id: 4, icon: 'circle', toolTipContent: 'Ellipse (2)' },
        { id: 5, icon: 'draw-polygon', toolTipContent: 'Polygone (3)' },
        { id: 6, icon: 'project-diagram', toolTipContent: 'Ligne (L)' },
        { id: 7, icon: 'font', toolTipContent: 'Texte (T)' },
        { id: 8, icon: 'fill-drip', toolTipContent: 'Sceau de peinture (B)' },
        { id: 9, icon: 'eraser', toolTipContent: 'Efface (E)' },
        { id: 10, icon: 'stamp', toolTipContent: 'Étampe (D)' },
        { id: 11, icon: 'eye-dropper', toolTipContent: 'Pipette (I)' },
        { id: 12, icon: 'border-all', toolTipContent: 'Options de zone de travail' },
        { id: 13, icon: 'plus', toolTipContent: 'Créer un nouveau dessin (Ctrl-O)' },
        { id: 14, icon: 'folder-open', toolTipContent: 'Voir le carrousel de dessins (Ctrl-G)' },
        { id: 15, icon: 'save', toolTipContent: 'Sauvegarder le dessin (Ctrl-S)' },
        { id: 16, icon: 'download', toolTipContent: 'Exporter le dessin (Ctrl-E)' },
    ];

    // tslint:disable-next-line: no-any (TEMPORARY)
    toggleActive(event: any, id: number): void {
        event.preventDefault();
        if (this.element !== undefined) {
            this.element.style.backgroundColor = 'rgb(33, 38, 43)';
        }
        const target = event.currentTarget;
        target.style.backgroundColor = '#e51282';
        this.element = target;

        // call function to assign current tool
    }

    get showDelays(): FormControl {
        return this.showDelay;
    }
}
