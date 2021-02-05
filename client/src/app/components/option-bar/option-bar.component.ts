import { DrawingService } from '@app/services/drawing/drawing.service';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-option-bar',
    templateUrl: './option-bar.component.html',
    styleUrls: ['./option-bar.component.scss'],
})
export class OptionBarComponent implements OnInit {
    readonly SHOW_DELAY_MS: number = 750;
    routerLink: RouterModule;
    showDelay: FormControl = new FormControl(this.SHOW_DELAY_MS);

    optionBarElements: { icon: string; toolTipContent: string }[] = [{ icon: 'plus', toolTipContent: 'Créer un nouveau dessin (Ctrl+O)' }];

    constructor(private drawingService: DrawingService) {}

    ngOnInit(): void {
        //
    }
    toggleActive(event: EventTarget, toolTipContent: string): void {
        if (toolTipContent === 'Créer un nouveau dessin (Ctrl+O)') {
            this.drawingService.handleNewDrawing();
        }
    }
}
