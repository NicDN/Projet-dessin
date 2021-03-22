import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CarouselDialogComponent } from '@app/components/dialogs/carousel-dialog/carousel-dialog.component';
import { ExportDialogComponent } from '@app/components/dialogs/export-dialog/export-dialog.component';
import { SaveDialogComponent } from '@app/components/dialogs/save-dialog/save-dialog.component';
import { Observable, Subject } from 'rxjs';

export enum DialogType {
    Carousel,
    Save,
    Export,
}

type Dialog = CarouselDialogComponent | ExportDialogComponent | SaveDialogComponent;

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    private subject: Subject<boolean> = new Subject<boolean>();
    private dialogRef: MatDialogRef<Dialog>;

    constructor(private dialog: MatDialog, private router: Router) {}

    openDialog(dialogType: DialogType): void {
        switch (dialogType) {
            case DialogType.Carousel: {
                this.dialogRef = this.dialog.open(CarouselDialogComponent, {
                    // override default size of angular dialog must be in ts file.
                    width: '1400px',
                    maxWidth: '100vw',
                });
                break;
            }
            case DialogType.Save: {
                if (this.router.url === '/home') {
                    return;
                }
                this.dialogRef = this.dialog.open(SaveDialogComponent);
                break;
            }
            case DialogType.Export: {
                if (this.router.url === '/home') {
                    return;
                }
                this.dialogRef = this.dialog.open(ExportDialogComponent);
                break;
            }
        }
        this.subject.next(false); // hotKeyService stops listening to keyEvents while dialog is opened

        this.dialogRef.afterClosed().subscribe(() => {
            this.subject.next(true); // hotKeyService restarts listening to keyEvents when dialog is closed
        });
    }

    listenToKeyEvents(): Observable<boolean> {
        return this.subject.asObservable();
    }
}
