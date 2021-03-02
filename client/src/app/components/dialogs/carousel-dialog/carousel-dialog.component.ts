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

    searchedTags: string[] = ['beau', 'bon', 'sexy'];

    drawingsMock: DrawingForm[] = [
        { id: 1, name: 'dessin1', tag: ['bon', 'pas cher'] },
        { id: 2, name: 'dessin2', tag: ['bon', 'pas cher'] },
        { id: 3, name: 'dessin3', tag: ['bon', 'pas cher'] },
        { id: 4, name: 'dessin4', tag: ['beau', 'pas cher'] },
        { id: 5, name: 'dessin5', tag: ['beau', 'bon', 'pas cher'] },
        { id: 7, name: 'dessin7', tag: ['beau', 'pas cher'] },
        { id: 8, name: 'dessin8', tag: ['beau', 'bon'] },
    ];

    private startIndex: number = 0;

    constructor(public carouselService: CarouselService, public dialogRef: MatDialogRef<CarouselDialogComponent>) {}

    ngOnInit(): void {
        this.requestDrawings();
    }

    requestDrawings(): void {
        this.carouselService.requestDrawingsFromServer().subscribe(
            (drawingForms) => {
                this.drawings = this.drawingsMock; // should be drawingForms
            },
            (err) => {
                console.log(err);
                // mat error si filtrage par etiquette ne trouve rien
            },
        );
    }

    // TODO: Goes in service ?
    // TODO: works but needs refactoring
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
    }

    searchWithNewTag(event: MatChipInputEvent): void {
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
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'ArrowLeft') {
            this.backwardDrawings();
        } else if (event.key === 'ArrowRight') {
            this.forwardDrawings();
        }
    }
}
