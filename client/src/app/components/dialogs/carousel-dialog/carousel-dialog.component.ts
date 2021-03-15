import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { CarouselService } from '@app/services/option/carousel/carousel.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { DrawingForm } from '@common/communication/drawing-form';

@Component({
    selector: 'app-carousel-dialog',
    templateUrl: './carousel-dialog.component.html',
    styleUrls: ['./carousel-dialog.component.scss'],
})
export class CarouselDialogComponent implements OnInit {
    @ViewChild('chipList') chipList: MatChipList;

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    drawings: DrawingForm[] = [];

    searchedTags: string[] = [];
    loading: boolean = false;

    private startIndex: number = 0;

    constructor(
        public carouselService: CarouselService,
        private snackBarService: SnackBarService,
        public dialogRef: MatDialogRef<CarouselDialogComponent>,
    ) {}

    ngOnInit(): void {
        this.requestDrawings();
    }

    async requestDrawings(): Promise<void> {
        this.loading = true;
        this.carouselService.requestDrawingsFromServer(this.searchedTags, this.startIndex).subscribe(
            (drawings) => {
                this.loading = false;
                this.drawings = drawings;

                this.validateFilter();
            },
            (error) => {
                this.snackBarService.openSnackBar(error, 'Fermer');
                this.loading = false;
            },
        );
    }

    private validateFilter(): void {
        this.searchedTags.length !== 0
            ? this.drawings.length === 0
                ? (this.chipList.errorState = true)
                : (this.chipList.errorState = false)
            : (this.chipList.errorState = false);
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
            this.requestDrawings();
        }
    }

    addTag(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if (value.trim()) {
            this.searchedTags.push(value);
            this.requestDrawings();
        }

        input.value = '';
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

    clearSearchedTags(): void {
        this.searchedTags = [];
        this.requestDrawings();
    }
}
