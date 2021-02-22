import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SaveDialogComponent } from '@app/components/dialogs/save-dialog/save-dialog.component';

@Injectable({
    providedIn: 'root',
})
export class SaveService {
    constructor(private dialog: MatDialog) {}

    openDialog(): void {
        this.dialog.open(SaveDialogComponent);
    }
}
