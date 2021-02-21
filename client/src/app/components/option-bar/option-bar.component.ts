import { Component } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Component({
    selector: 'app-option-bar',
    templateUrl: './option-bar.component.html',
    styleUrls: ['./option-bar.component.scss'],
})
export class OptionBarComponent {
    optionBarElements: { icon: string; toolTipContent: string; action?: () => void }[] = [
        { icon: 'plus', toolTipContent: 'Créer un nouveau dessin (Ctrl+O)', action: () => this.drawingService.handleNewDrawing() },
        { icon: 'cloud-upload-alt', toolTipContent: 'Sauvegarder le dessin (Ctrl-S)' },
        { icon: 'download', toolTipContent: 'Exporter le dessin (Ctrl-E)' },
        { icon: 'photo-video', toolTipContent: 'Voir le carrousel de dessins (Ctrl-G)' },
    ];

    constructor(private drawingService: DrawingService) {}

    toggleOptionEvent(action: () => void): void {
        action();
    }
}
