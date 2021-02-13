import { Component } from '@angular/core';
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
