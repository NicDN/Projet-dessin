import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ExportService } from '@app/services/option/export/export.service';

const NEXT_PIXEL = 4;
const RED_GREY_RATIO = 0.3;
const GREEN_GREY_RATIO = 0.59;
const BLUE_GREY_RATIO = 0.11;

@Component({
    selector: 'app-export-dialog',
    templateUrl: './export-dialog.component.html',
    styleUrls: ['./export-dialog.component.scss'],
})
export class ExportDialogComponent implements AfterViewInit {
    @ViewChild('filterCanvas', { static: false }) filterCanvas: ElementRef<HTMLCanvasElement>;
    filters: string[] = ['Aucun filtre', 'Noir et blanc', 'Filtre2', 'Filtre3', 'Filtre4', 'Filtre5'];

    selectedFilter: string = 'Aucun filtre';
    private filterCanvasCtx: CanvasRenderingContext2D;

    constructor(
        public drawingService: DrawingService,
        private exportService: ExportService,
        private dialogRef: MatDialogRef<ExportDialogComponent>,
    ) {}

    ngAfterViewInit(): void {
        this.filterCanvas.nativeElement.style.border = '2px solid black';
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
    }

    invertingColorFilter(): void {
        this.resetWithNotFilter();
        const imgData = this.filterCanvasCtx.getImageData(0, 0, this.filterCanvas.nativeElement.width, this.filterCanvas.nativeElement.height);
        const pixels = imgData.data;
        const numberOfPixels = pixels.length;
        const maxValue = 255;
        for (let i = 0; i < numberOfPixels; i += NEXT_PIXEL) {
            pixels[i] = maxValue - pixels[i];
            pixels[i + 1] = maxValue - pixels[i + 1];
            pixels[i + 2] = maxValue - pixels[i + 2];
        }
        this.filterCanvasCtx.putImageData(imgData, 0, 0);
    }

    redGreenBlueFilter(): void {
        this.resetWithNotFilter();
        const imgData = this.filterCanvasCtx.getImageData(0, 0, this.filterCanvas.nativeElement.width, this.filterCanvas.nativeElement.height);
        const pixels = imgData.data;
        const numberOfPixels = pixels.length;
        for (let i = 0; i < numberOfPixels; i += NEXT_PIXEL) {
            const oldR = pixels[i];
            const oldG = pixels[i + 1];
            const oldB = pixels[i + 2];
            pixels[i] = oldG;
            pixels[i + 1] = oldB;
            pixels[i + 2] = oldR;
        }
        this.filterCanvasCtx.putImageData(imgData, 0, 0);
    }

    blurFilter(): void {
        this.resetWithNotFilter();
        this.filterCanvas.nativeElement.style.filter = 'blur(2px)';
    }

    resetWithNotFilter(): void {
        this.filterCanvas.nativeElement.style.filter = 'blur(0px)';
        this.filterCanvasCtx.drawImage(this.drawingService.canvas, 0, 0);
    }

    exportCanvas(fileName: string, fileFormat: string): void {
        this.exportService.exportCanvas(fileName, fileFormat, this.filterCanvas);
        this.closeDialog();
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
