import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ExportService } from '@app/services/option/export/export.service';
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
            this.grayScale(this.filterCanvasCtx, this.filterCanvas.nativeElement);
        } else {
            this.filterCanvasCtx.drawImage(this.drawingService.canvas, 0, 0);
        }
    }

    grayScale(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        // Reference https://www.htmlgoodies.com/html5/javascript/display-images-in-black-and-white-using-the-html5-canvas.html
        const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;
        for (var i = 0, n = pixels.length; i < n; i += 4) {
            const grayscale = pixels[i] * 0.3 + pixels[i + 1] * 0.59 + pixels[i + 2] * 0.11;
            pixels[i] = grayscale; // red
            pixels[i + 1] = grayscale; // green
            pixels[i + 2] = grayscale; // blue
            //pixels[i+3]              is alpha
        }
        //redraw the image in black & white
        context.putImageData(imgData, 0, 0);
    }

    exportCanvas(fileName: string, fileFormat: string): void {
        this.exportService.exportCanvas(fileName, fileFormat, this.filterCanvas);
        this.closeDialog();
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
