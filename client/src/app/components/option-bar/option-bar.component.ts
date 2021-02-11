import { Component, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';

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
    constructor(private drawingService: DrawingService, public hotkeyService: HotkeyService) {}

    toggleActive(event: EventTarget, toolTipContent: string): void {
        if (toolTipContent === 'Créer un nouveau dessin (Ctrl+O)') {
            this.drawingService.handleNewDrawing();
        }
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.hotkeyService.onKeyDown(event);
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.hotkeyService.onKeyUp(event);
    }
}
