import { Component, HostListener } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
    selector: 'app-bottom-sheet-confirm-new-drawing',
    templateUrl: './bottom-sheet-confirm-new-drawing.component.html',
    styleUrls: ['./bottom-sheet-confirm-new-drawing.component.scss'],
})
export class BottomSheetConfirmNewDrawingComponent {
    constructor(private bottomSheetRef: MatBottomSheetRef<BottomSheetConfirmNewDrawingComponent>) {}

    closeBottomSheet(confirm: boolean): void {
        this.bottomSheetRef.dismiss(confirm);
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.key !== 'Enter') {
            return;
        }
        this.closeBottomSheet(true);
    }
}
