import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
    selector: 'app-stamp-library-bottom-sheet',
    templateUrl: './stamp-library-bottom-sheet.component.html',
    styleUrls: ['./stamp-library-bottom-sheet.component.scss'],
})
export class StampLibraryBottomSheetComponent {
    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) public stamps: { stamps: string[] },
        private bottomSheetRef: MatBottomSheetRef<StampLibraryBottomSheetComponent>,
    ) {}

    chooseStamp(stampSrc: string): void {
        this.bottomSheetRef.dismiss(stampSrc);
    }
}
