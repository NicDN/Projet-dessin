import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FilterService, FilterType } from '@app/services/filter/filter.service';
import { ExportService } from '@app/services/option/export/export.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
// import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';

@Component({
    templateUrl: './export-dialog.component.html',
    styleUrls: ['./export-dialog.component.scss'],
})
export class ExportDialogComponent implements AfterViewInit {
    @ViewChild('canvas', { static: false }) canvas: ElementRef<HTMLCanvasElement>;

    private canvasCtx: CanvasRenderingContext2D;
    exportToImgur: boolean = false;

    constructor(
        public drawingService: DrawingService,
        public exportService: ExportService,
        public dialogRef: MatDialogRef<ExportDialogComponent>,
        public filterService: FilterService,
        private snackBarService: SnackBarService,
    ) {}

    ngAfterViewInit(): void {
        this.canvasCtx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.canvasCtx.drawImage(this.drawingService.canvas, 0, 0);
        this.exportService.canvasToExport = this.canvas.nativeElement;
    }

    applyFilter(filterType: FilterType): void {
        this.filterService.applyFilter(filterType, this.canvas.nativeElement);
    }

    async exportCanvas(fileName: string, fileFormat: string): Promise<void> {
        await this.exportService
            .exportCanvas(fileName, fileFormat, this.exportToImgur)
            .then((url) => {
                this.snackBarService.openSnackBar("Le téléversement a été effectué avec succès! Voici l'URL publique: " + url, 'Fermer', 10000);
            })
            .catch(() => {
                this.snackBarService.openSnackBar('Le téléversement a échoué.', 'Fermer', 2000);
            });

        this.dialogRef.close();
    }
}
