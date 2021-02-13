import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DrawingService } from '@app/services/drawing/drawing.service';

enum Options {
    NEWDRAWING = 'Créer un nouveau dessin (Ctrl+O)',
}

type OptionBarSelector = {
    [key in Options]: () => void;
};

@Component({
    selector: 'app-option-bar',
    templateUrl: './option-bar.component.html',
    styleUrls: ['./option-bar.component.scss'],
})
export class OptionBarComponent {
    readonly SHOW_DELAY_MS: number = 750;
    routerLink: RouterModule;
    showDelay: FormControl = new FormControl(this.SHOW_DELAY_MS);
    optionBarElements: { icon: string; toolTipContent: string }[] = [{ icon: 'plus', toolTipContent: 'Créer un nouveau dessin (Ctrl+O)' }];

    options: OptionBarSelector;

    constructor(private drawingService: DrawingService) {
        this.options = {
            'Créer un nouveau dessin (Ctrl+O)': () => this.drawingService.handleNewDrawing(),
        };
    }

    toggleActive(event: EventTarget, toolTipContent: string): void {
        this.options[toolTipContent as Options]?.();
    }
}
