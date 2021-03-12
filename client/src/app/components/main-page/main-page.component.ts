import { Component, HostListener } from '@angular/core';
import { DialogService, DialogType } from '@app/services/dialog/dialog.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    dialogType: DialogType = DialogType.Carousel;

    constructor(private hotkeyService: HotkeyService, public dialogService: DialogService) {}

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.hotkeyService.onKeyDown(event);
    }
}
