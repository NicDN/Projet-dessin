import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Filter, FilterService, FilterType } from '@app/services/filter/filter.service';
import { ExportService } from '@app/services/option/export/export.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { ClipboardService } from 'ngx-clipboard';
@Component({
    templateUrl: './export-dialog.component.html',
    styleUrls: ['./export-dialog.component.scss'],
})
export class ExportDialogComponent implements AfterViewInit {
    @ViewChild('canvas', { static: false }) canvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('fileName') fileName: MatInput;
    @ViewChild('fileFormat') fileFormat: MatInput;

    private canvasCtx: CanvasRenderingContext2D;
    private readonly IMGUR_SNACK_BAR_TIME_MS: number = 20000;

    loadingImpgurState = false;

    exportToImgur: boolean = false;

    constructor(
        public drawingService: DrawingService,
        public exportService: ExportService,
        public dialogRef: MatDialogRef<ExportDialogComponent>,
        public filterService: FilterService,
        private snackBarService: SnackBarService,
        private clipboardService: ClipboardService,
    ) {}

    selectedFilter: Filter = this.filterService.filters[0];

    ngAfterViewInit(): void {
        this.canvasCtx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.canvasCtx.drawImage(this.drawingService.canvas, 0, 0);
        this.exportService.canvasToExport = this.canvas.nativeElement;
    }

    applyFilter(filterType: FilterType): void {
        this.filterService.applyFilter(filterType, this.canvas.nativeElement);
    }

    async exportCanvas(fileName: string, fileFormat: string): Promise<void> {
        if (!this.exportToImgur) {
            this.exportService.handleLocalExport(fileName, fileFormat);
            this.dialogRef.close();
            return;
        }

        this.loadingImpgurState = true;

        await this.exportService
            .handleImgurExport(fileFormat)
            .then((url) => {
                this.displaySnackBarOnSuccess(url);
            })
            .catch(() => {
                this.snackBarService.openSnackBar('Le téléversement a échoué.', 'Fermer');
            });

        this.loadingImpgurState = false;

        this.dialogRef.close();
    }

    private displaySnackBarOnSuccess(url: string): void {
        const snackBarRef = this.snackBarService.openSnackBar(
            'Le téléversement a été effectué avec succès! URL: ' + url,
            "Copier l'URL",
            this.IMGUR_SNACK_BAR_TIME_MS,
        );

        snackBarRef.onAction().subscribe(() => {
            this.clipboardService.copy(url);
        });
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.key !== 'Enter') {
            return;
        }
        this.exportCanvas(this.fileName.value, this.fileFormat.value);
    }
}
