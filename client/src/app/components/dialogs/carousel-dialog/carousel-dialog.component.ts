import { Component, HostListener, OnInit } from '@angular/core';
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
    drawings: DrawingForm[];

    drawingsMock: DrawingForm[] = [
        { id: 1, name: 'dessin1', tag: ['beau', 'bon', 'pas cher'] },
        { id: 2, name: 'dessin2', tag: ['beau', 'bon', 'pas cher'] },
        { id: 3, name: 'dessin3', tag: ['bon', 'pas cher'] },
        { id: 4, name: 'dessin4', tag: ['beau', 'pas cher'] },
        { id: 5, name: 'dessin5', tag: ['beau', 'bon', 'pas cher'] },
        { id: 7, name: 'dessin7', tag: ['beau', 'pas cher'] },
        { id: 8, name: 'dessin8', tag: ['beau', 'bon'] },
    ];

    startIndex: number = 0;
    offsetIndex: number = this.DRAWINGS_MAX_COUNT;

    constructor(public carouselService: CarouselService, public dialogRef: MatDialogRef<CarouselDialogComponent>) {}

    ngOnInit(): void {
        this.requestDrawings();
    }

    requestDrawings(): void {
        this.carouselService.requestDrawingsFromServer().subscribe((drawingForms) => {
            this.drawings = this.drawingsMock; // should be drawingForms
        });
    }

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

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'ArrowLeft') {
            this.backwardDrawings();
        } else if (event.key === 'ArrowRight') {
            this.forwardDrawings();
        }
    }
}
