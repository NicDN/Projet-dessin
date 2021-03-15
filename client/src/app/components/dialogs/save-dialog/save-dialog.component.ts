import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SaveService } from '@app/services/option/save/save.service';

@Component({
    selector: 'app-save-dialog',
    templateUrl: './save-dialog.component.html',
    styleUrls: ['./save-dialog.component.scss'],
})
export class SaveDialogComponent {
    @ViewChild('chipList') chipList: ElementRef;

    private readonly TAG_MAX_LENGTH: number = 10;
    private readonly TAG_MIN_LENGTH: number = 2;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    tags: string[] = [];
    savingState: boolean = false; // boolean set to true while saving
    uniqueTagError: boolean = false;

    fileNameFormControl: FormControl = new FormControl('', Validators.required);

    tagFormControl: FormControl = new FormControl('', [
        Validators.maxLength(this.TAG_MAX_LENGTH),
        Validators.minLength(this.TAG_MIN_LENGTH),
        this.uniqueTagValidator.bind(this),
        Validators.pattern('[a-zA-Z ]*'),
    ]);

    constructor(private saveService: SaveService, public dialogRef: MatDialogRef<SaveDialogComponent>, private snackBar: MatSnackBar) {}

    postDrawing(fileName: string): void {
        this.savingState = true;
        this.saveService.postDrawing(fileName, this.tags).subscribe(
            // tslint:disable-next-line: no-empty
            () => {},
            (error) => {
                this.savingState = false;
                this.openSnackBar(error, 'Fermer');
            },
            () => {
                this.savingState = false;
                this.openSnackBar('Le dessin a été sauvegardé avec succès.', 'Fermer');
                this.dialogRef.close();
            },
        );
    }

    removeTag(tag: string): void {
        const index = this.tags.indexOf(tag);
        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }

    addTag(event: MatChipInputEvent): void {
        if (this.tagFormControl.invalid) {
            return;
        }

        const input = event.input;
        const value = event.value;

        if (value.trim()) {
            this.tags.push(value);
        }

        input.value = '';
    }

    clearTags(): void {
        this.tags = [];
    }

    private openSnackBar(message: string, action: string): void {
        this.snackBar.open(message, action, {
            duration: 5000,
        });
    }

    private uniqueTagValidator(control: AbstractControl): { [key: string]: boolean } | null {
        this.uniqueTagError = false;
        if (this.tags.includes(control.value)) {
            this.uniqueTagError = true;
            return { nonUniqueTagFound: true };
        }
        return null;
    }
}
