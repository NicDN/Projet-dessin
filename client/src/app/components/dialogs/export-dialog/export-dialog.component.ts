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
        if (this.exportToImgur) {
            await this.exportService
                .handleImgurExport(fileName, fileFormat)
                .then((url) => {
                    const IMGUR_SNACK_BAR_TIME_MS = 20000;
                    this.snackBarService.openSnackBar(
                        'Le téléversement a été effectué avec succès! URL publique: ' + url,
                        'Fermer',
                        IMGUR_SNACK_BAR_TIME_MS,
                    );
                })
                .catch(() => {
                    this.snackBarService.openSnackBar('Le téléversement a échoué.', 'Fermer');
                });
        } else {
            this.exportService.handleLocalExport(fileName, fileFormat);
        }

        this.dialogRef.close();
    }
}
