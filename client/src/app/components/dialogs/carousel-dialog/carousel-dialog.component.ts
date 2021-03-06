import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { CarouselService } from '@app/services/option/carousel/carousel.service';
import { DrawingForm } from '@common/communication/drawingForm';
// import { DrawingForm } from '@common/communication/drawingForm';
@Component({
    selector: 'app-carousel-dialog',
    templateUrl: './carousel-dialog.component.html',
    styleUrls: ['./carousel-dialog.component.scss'],
})
export class CarouselDialogComponent implements OnInit {
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    readonly DRAWINGS_MAX_COUNT: number = 3;
    drawings: DrawingForm[];

    searchedTags: string[] = [];

    noDrawingError: boolean = true;

    private startIndex: number = 0;

    constructor(public carouselService: CarouselService, public dialogRef: MatDialogRef<CarouselDialogComponent>) {}

    ngOnInit(): void {
        this.requestDrawings();
    }

    requestDrawings(): void {
        this.carouselService.requestDrawingsFromServer(this.searchedTags).subscribe((drawings) => {
            this.drawings = drawings;
        });
    }

    getSlicedDrawings(): DrawingForm[] {
        let tempArr: DrawingForm[] = [];
        if (this.startIndex === this.drawings.length - 1) {
            tempArr = this.drawings.slice(0, 2);
            tempArr.unshift(this.drawings[this.drawings.length - 1]);
        } else if (this.startIndex === this.drawings.length - 2) {
            tempArr.push(this.drawings[this.drawings.length - 2]);
            tempArr.push(this.drawings[this.drawings.length - 1]);
            tempArr.push(this.drawings[0]);
        } else {
            tempArr = this.drawings.slice(this.startIndex, this.startIndex + this.DRAWINGS_MAX_COUNT);
        }
        return tempArr;
    }

    forwardDrawings(): void {
        this.startIndex === this.drawings.length - 1 ? (this.startIndex = 0) : this.startIndex++;
    }

    backwardDrawings(): void {
        this.startIndex === 0 ? (this.startIndex = this.drawings.length - 1) : this.startIndex--;
    }

    removeTag(tag: string): void {
        const index = this.searchedTags.indexOf(tag);
        if (index >= 0) {
            this.searchedTags.splice(index, 1);
        }

        this.requestDrawings();
    }

    addTag(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // add tag to searchedTags array
        if ((value || '').trim()) {
            this.searchedTags.push(value);
        }
        // Reset the input value
        if (input) {
            input.value = '';
        }

        this.requestDrawings();
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'ArrowLeft') {
            this.backwardDrawings();
        } else if (event.key === 'ArrowRight') {
            this.forwardDrawings();
        }
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
