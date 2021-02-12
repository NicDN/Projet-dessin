import { Component } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Component({
    selector: 'app-option-bar',
    templateUrl: './option-bar.component.html',
    styleUrls: ['./option-bar.component.scss'],
})
export class OptionBarComponent {
    optionBarElements: { icon: string; toolTipContent: string }[] = [{ icon: 'plus', toolTipContent: 'Créer un nouveau dessin (Ctrl+O)' }];

    constructor(private drawingService: DrawingService) {}

    toggleActive(event: EventTarget, toolTipContent: string): void {
        // pas de la bonne facon de passer le hotkey crtl+o avec le tooltipcontent
        if (toolTipContent === 'Créer un nouveau dessin (Ctrl+O)') {
            this.drawingService.handleNewDrawing();
        }
    }
}
