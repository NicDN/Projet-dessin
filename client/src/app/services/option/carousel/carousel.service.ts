import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarouselDialogComponent } from '@app/components/dialogs/carousel-dialog/carousel-dialog.component';

@Injectable({
    providedIn: 'root',
})
export class CarouselService {
    constructor(private dialog: MatDialog) {}

    openDialog(): void {
        this.dialog.open(CarouselDialogComponent);
    }
}
