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
        // this.filterCanvas.nativeElement = this.drawingService.canvas;
        this.filterCanvasCtx = this.filterCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        // this.filterCanvasCtx = this.drawingService.baseCtx;
        this.filterCanvasCtx.drawImage(this.drawingService.canvas, -100, -100);
        // this.filterCanvasCtx.scale(9, 3);
        this.filterCanvasCtx.fillRect(0, 0, 2, 2);
    }

    exportCanvas(fileName: string, fileFormat: string): void {
        this.exportService.exportCanvas(fileName, fileFormat, this.filterCanvas);
        this.closeDialog();
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
