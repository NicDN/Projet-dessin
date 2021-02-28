import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FilterService, FilterType } from '@app/services/filter/filter.service';
import { ExportService } from '@app/services/option/export/export.service';

@Component({
    templateUrl: './export-dialog.component.html',
    styleUrls: ['./export-dialog.component.scss'],
})
export class ExportDialogComponent implements AfterViewInit {
    @ViewChild('canvas', { static: false }) canvas: ElementRef<HTMLCanvasElement>;

    private canvasCtx: CanvasRenderingContext2D;

    constructor(
        public drawingService: DrawingService,
        private exportService: ExportService,
        public dialogRef: MatDialogRef<ExportDialogComponent>,
        public filterService: FilterService,
    ) {}

    ngAfterViewInit(): void {
<<<<<<< HEAD
        this.filterCanvasCtx = this.filterCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.filterCanvasCtx.drawImage(this.drawingService.canvas, 0, 0);
    }

    changeFilter(): void {
        // VERY TEMPORARY, should use type in or smthg similar instead of if and else
        if (this.selectedFilter === 'Noir et blanc') {
            this.grayScale();
        }
        if (this.selectedFilter === 'Aucun filtre') {
            this.resetWithNotFilter();
        }
        if (this.selectedFilter === 'Filtre2') {
            this.brightnessFilter();
        }
        if (this.selectedFilter === 'Filtre3') {
            this.invertingColorFilter();
        }
        if (this.selectedFilter === 'Filtre4') {
            this.redGreenBlueFilter();
        }
        if (this.selectedFilter === 'Filtre5') {
            this.blurFilter();
        }
    }

    grayScale(): void {
        // Reference https://www.htmlgoodies.com/html5/javascript/display-images-in-black-and-white-using-the-html5-canvas.html
        this.resetWithNotFilter();
        const imgData = this.filterCanvasCtx.getImageData(0, 0, this.filterCanvas.nativeElement.width, this.filterCanvas.nativeElement.height);
        const pixels = imgData.data;
        const numberOfPixels = pixels.length;
        for (let i = 0; i < numberOfPixels; i += NEXT_PIXEL) {
            const grayscale = pixels[i] * RED_GREY_RATIO + pixels[i + 1] * GREEN_GREY_RATIO + pixels[i + 2] * BLUE_GREY_RATIO;
            pixels[i] = grayscale;
            pixels[i + 1] = grayscale;
            pixels[i + 2] = grayscale;
        }
        // redraw the image in black & white
        this.filterCanvasCtx.putImageData(imgData, 0, 0);
    }

    brightnessFilter(): void {
        this.resetWithNotFilter();
        const imgData = this.filterCanvasCtx.getImageData(0, 0, this.filterCanvas.nativeElement.width, this.filterCanvas.nativeElement.height);
        const pixels = imgData.data;
        const numberOfPixels = pixels.length;
        const adjustement = 60;
        for (let i = 0; i < numberOfPixels; i += NEXT_PIXEL) {
            pixels[i] += adjustement;
            pixels[i + 1] += adjustement;
            pixels[i + 2] += adjustement;
        }
        this.filterCanvasCtx.putImageData(imgData, 0, 0);
=======
        this.canvasCtx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.canvasCtx.drawImage(this.drawingService.canvas, 0, 0);
        this.exportService.canvasToExport = this.canvas.nativeElement;
>>>>>>> master
    }

    applyFilter(filterType: FilterType): void {
        this.filterService.applyFilter(filterType, this.canvas.nativeElement);
    }

    exportCanvas(fileName: string, fileFormat: string): void {
        this.exportService.exportCanvas(fileName, fileFormat);
        this.dialogRef.close();
    }
}
