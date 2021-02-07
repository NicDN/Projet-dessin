import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DrawingService } from '@app/services/drawing/drawing.service';

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

    controlKeyDown: boolean = false;

    constructor(private drawingService: DrawingService) {}

    ngOnInit(): void {
        //
    }
    toggleActive(event: EventTarget, toolTipContent: string): void {
        if (toolTipContent === 'Créer un nouveau dessin (Ctrl+O)') {
            this.drawingService.handleNewDrawing();
        }
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        event.stopPropagation();
        if (event.ctrlKey) {
            this.controlKeyDown = true;
            event.preventDefault();
        }
        switch (event.code) {
            case 'KeyO':
                if (this.controlKeyDown) this.drawingService.handleNewDrawing();
                break;
            default:
            /* Nothing happens if a random key is pressed */
            /* Maybe we want this to be in a service */
        }
        event.returnValue = true; // Renables shortcuts like f11
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        if (event.ctrlKey) this.controlKeyDown = false;
    }
}
