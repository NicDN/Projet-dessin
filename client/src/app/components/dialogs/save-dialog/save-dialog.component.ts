import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, HostListener, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { SaveService } from '@app/services/option/save/save.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';

@Component({
    selector: 'app-save-dialog',
    templateUrl: './save-dialog.component.html',
    styleUrls: ['./save-dialog.component.scss'],
})
export class SaveDialogComponent {
    @ViewChild('saveButton') saveButton: MatButton;

    private readonly TAG_MAX_LENGTH: number = 10;
    private readonly TAG_MIN_LENGTH: number = 2;

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    tags: string[] = [];
    savingState: boolean = false;
    uniqueTagError: boolean = false;
    inputFocus: boolean = false;

    fileNameFormControl: FormControl = new FormControl('', Validators.required);

    tagFormControl: FormControl = new FormControl('', [
        Validators.maxLength(this.TAG_MAX_LENGTH),
        Validators.minLength(this.TAG_MIN_LENGTH),
        this.uniqueTagValidator.bind(this),
        Validators.pattern('[a-zA-Z ]*'),
    ]);

    constructor(private saveService: SaveService, public dialogRef: MatDialogRef<SaveDialogComponent>, private snackBarService: SnackBarService) {}

    postDrawing(fileName: string): void {
        this.savingState = true;
        this.saveService.postDrawing(fileName, this.tags).subscribe(
            () => {
                this.savingState = false;
                this.snackBarService.openSnackBar('Le dessin a été sauvegardé avec succès.', 'Fermer');
                this.dialogRef.close();
            },
            (error) => {
                this.savingState = false;
                this.snackBarService.openSnackBar(error, 'Fermer');
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

    private uniqueTagValidator(control: AbstractControl): { [key: string]: boolean } | null {
        this.uniqueTagError = false;
        if (this.tags.includes(control.value)) {
            this.uniqueTagError = true;
            return { nonUniqueTagFound: true };
        }
        return null;
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.key !== 'Enter') {
            return;
        } else {
            // debugger;
            this.saveButton.focus();
        }
        if (this.saveButton.disabled) {
            return;
        }
        if (this.inputFocus) {
            return;
        }
        this.postDrawing(this.fileNameFormControl.value);
    }
}
