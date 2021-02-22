import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ExportDialogComponent } from '@app/components/dialogs/export-dialog/export-dialog.component';

@Injectable({
    providedIn: 'root',
})
export class ExportService {
    constructor(private dialog: MatDialog) {}

    openDialog(): void {
        this.dialog.open(ExportDialogComponent);
    }
}
