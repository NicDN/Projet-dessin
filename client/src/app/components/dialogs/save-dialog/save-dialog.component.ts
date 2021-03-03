import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FilterService } from '@app/services/filter/filter.service';
import { SaveService } from '@app/services/option/save/save.service';
@Component({
    selector: 'app-save-dialog',
    templateUrl: './save-dialog.component.html',
    styleUrls: ['./save-dialog.component.scss'],
})
export class SaveDialogComponent {
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    tags: string[] = [];
    savingState: boolean = false;

    formGroup: FormGroup = new FormGroup({
        fileNameFormControl: new FormControl('', Validators.required),
        tagFormControl: new FormControl(''),
    });

    constructor(
        public drawingService: DrawingService,
        private saveService: SaveService,
        public filterService: FilterService,
        public dialogRef: MatDialogRef<SaveDialogComponent>,
    ) {}

    postCanvas(fileName: string): void {
        this.saveService.postCanvas(fileName, this.tags).finally(() => {
            this.savingState = false;
        });
        this.dialogRef.close();
    }

    removeTag(tag: string): void {
        const index = this.tags.indexOf(tag);
        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }

    addTag(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // add tag to searchedTags array
        if ((value || '').trim()) {
            this.tags.push(value);
        }
        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    clearTags(): void {
        this.tags = [];
    }
}
