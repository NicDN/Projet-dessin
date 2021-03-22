import { Component } from '@angular/core';
import { DialogService, DialogType } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

interface OptionBarElement {
    icon: string;
    toolTipContent: string;
    action: () => void;
}

@Component({
    selector: 'app-option-bar',
    templateUrl: './option-bar.component.html',
    styleUrls: ['./option-bar.component.scss'],
})
export class OptionBarComponent {
    optionBarElements: OptionBarElement[] = [
        { icon: 'plus', toolTipContent: 'Créer un nouveau dessin (Ctrl+O)', action: () => this.drawingService.handleNewDrawing() },
        { icon: 'cloud-upload-alt', toolTipContent: 'Sauvegarder le dessin (Ctrl-S)', action: () => this.dialogService.openDialog(DialogType.Save) },
        { icon: 'download', toolTipContent: 'Exporter le dessin (Ctrl-E)', action: () => this.dialogService.openDialog(DialogType.Export) },
        {
            icon: 'images',
            toolTipContent: 'Voir le carrousel de dessins (Ctrl-G)',
            action: () => this.dialogService.openDialog(DialogType.Carousel),
        },
    ];

    constructor(private drawingService: DrawingService, private dialogService: DialogService) {}
}
