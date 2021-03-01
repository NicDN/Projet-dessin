import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CarouselService } from '@app/services/option/carousel/carousel.service';
import { DrawingForm } from '@common/communication/drawingForm';
@Component({
    selector: 'app-carousel-dialog',
    templateUrl: './carousel-dialog.component.html',
    styleUrls: ['./carousel-dialog.component.scss'],
})
export class CarouselDialogComponent implements OnInit {
    readonly DRAWINGS_MAX_COUNT: number = 3;

    drawings: DrawingForm[] = [
        { id: 1, name: 'dessin1', tag: 'beau' },
        { id: 2, name: 'dessin2', tag: 'sexy' },
        { id: 3, name: 'dessin3', tag: 'beau' },
        { id: 4, name: 'dessin4', tag: 'sexy' },
        { id: 5, name: 'dessin5', tag: 'beau' },
        { id: 6, name: 'dessin6', tag: 'sexy' },
        { id: 7, name: 'dessin7', tag: 'beau' },
        { id: 8, name: 'dessin8', tag: 'sexy' },
    ];

    startIndex: number = 0;
    offsetIndex: number = this.DRAWINGS_MAX_COUNT;

    constructor(public carouselService: CarouselService, public dialogRef: MatDialogRef<CarouselDialogComponent>) {}

    ngOnInit(): void {
        this.getDrawings();
    }

    getDrawings(): void {
        // commented to avoid errors
        // this.carouselService.requestDrawingsFromServer().subscribe((drawingForms) => {
        //     this.drawings = drawingForms;
        // });
    }

    getSlicedDrawings(): DrawingForm[] {
        // if (this.startIndex === this.drawings.length - 1) {
        //     return this.drawings[this.startIndex] + this.drawings.slice(0, 2);
        // } else if (this.startIndex === this.drawings.length - 2) {

        // } else {
        return this.drawings.slice(this.startIndex, this.startIndex + this.DRAWINGS_MAX_COUNT);
        // }
    }

    forwardDrawingList(): void {
        this.startIndex === this.drawings.length - 1 ? (this.startIndex = 0) : this.startIndex++;
    }

    backwardDrawingList(): void {
        this.startIndex === 0 ? (this.startIndex = this.drawings.length - 1) : this.startIndex--;
    }
}
