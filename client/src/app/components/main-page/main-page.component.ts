import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService, DialogType } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { LocalStorageService } from '@app/services/local-storage/local-storage.service';
// import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    dialogType: DialogType = DialogType.Carousel;

    constructor(
        private hotkeyService: HotkeyService,
        public dialogService: DialogService,
        public localStorageService: LocalStorageService,
        private drawingService: DrawingService,
        private router: Router, // private undoRedoService: UndoRedoService,
    ) {}

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.hotkeyService.onKeyDown(event);
    }

    continueDrawing(): void {
        const image = new Image();
        image.src = localStorage.getItem('canvas') as string;
        console.log('wheres our imageeeeee ' + image.width + ' ' + image.height);
        // BOOLEAN HAS TO BE REMOVED, SHOULD NOT BE IN UNDO-REDO
        // this.undoRedoService.canSaveToStorage = false;

        this.drawingService.newImage = image;
        this.router.navigate(['editor']);
    }
    openNewDrawing(): void {
        this.drawingService.newImage = undefined;
        this.router.navigate(['editor']);
    }

    // for testing
    emptyStorage(): void {
        localStorage.clear();
    }
}
