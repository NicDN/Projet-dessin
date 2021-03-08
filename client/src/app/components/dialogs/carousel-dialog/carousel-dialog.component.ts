import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { CarouselService } from '@app/services/option/carousel/carousel.service';
import { DrawingForm } from '@common/communication/drawingForm';

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
    loading: boolean = false;

    private startIndex: number = 0;

    constructor(public carouselService: CarouselService, public dialogRef: MatDialogRef<CarouselDialogComponent>) {}

    ngOnInit(): void {
        this.requestDrawings();
    }

    requestDrawings(): void {
        this.loading = true;
        this.carouselService.requestDrawingsFromServer(this.searchedTags, this.startIndex).subscribe((drawings) => {
            this.loading = false;
            this.drawings = drawings;
        });
    }

    async forwardDrawings(): Promise<void> {
        this.startIndex++;
        await this.requestDrawings();
    }

    async backwardDrawings(): Promise<void> {
        this.startIndex--;
        await this.requestDrawings();
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

    clearTags(): void {
        this.searchedTags = [];
        this.requestDrawings();
    }
}
