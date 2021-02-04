import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CanvasCommunicationService } from '@app/services/canvas_coms/canvas-communication.service';

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

    constructor(private comsService: CanvasCommunicationService) {}

    ngOnInit(): void {
        //
    }
    toggleActive(event: EventTarget, toolTipContent: string): void {
        if (toolTipContent === 'Créer un nouveau dessin (Ctrl+O)') {
            this.executeNewDrawing();
        }
    }

    executeNewDrawing(): void {
        if (!this.comsService.checkIfCanvasIsEmpty()) {
            const response = confirm('Si vous créez un nouveau dessin, vos changements seront perdus. Voulez-vous continuer ?');
            if (response === true) {
                window.location.reload(); // This is temporary, we'll have to do smthg else someday ( using server instead );
            }
        } else {
            window.location.reload();
        }
    }
}
