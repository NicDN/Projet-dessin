import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FilterService, FilterType } from '@app/services/filter/filter.service';
import { ExportService } from '@app/services/option/export/export.service';

interface Filter {
    filterType: FilterType;
    name: string;
}

@Component({
    selector: 'app-export-dialog',
    templateUrl: './export-dialog.component.html',
    styleUrls: ['./export-dialog.component.scss'],
})
export class ExportDialogComponent implements AfterViewInit {
    @ViewChild('canvas', { static: false }) canvas: ElementRef<HTMLCanvasElement>;

    filters: Filter[] = [
        { filterType: FilterType.NoFilter, name: 'Aucun filtre' },
        { filterType: FilterType.GrayScale, name: 'Noir et blanc' },
        { filterType: FilterType.Saturate, name: 'Saturé' },
        { filterType: FilterType.InvertColor, name: 'Couleur inverses' },
        { filterType: FilterType.Blur, name: 'Embrouillé' },
        { filterType: FilterType.Sepia, name: 'Sepia' },
    ];

    private canvasCtx: CanvasRenderingContext2D;

    constructor(
        public drawingService: DrawingService,
        private exportService: ExportService,
        private dialogRef: MatDialogRef<ExportDialogComponent>,
        private filterService: FilterService,
    ) {}

    ngAfterViewInit(): void {
        this.canvasCtx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.canvasCtx.drawImage(this.drawingService.canvas, 0, 0);
    }

    applyFilter(filterType: FilterType): void {
        this.filterService.applyFilter(filterType, this.canvas);
    }

    exportCanvas(fileName: string, fileFormat: string): void {
        this.exportService.exportCanvas(fileName, fileFormat);
        this.closeDialog();
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
