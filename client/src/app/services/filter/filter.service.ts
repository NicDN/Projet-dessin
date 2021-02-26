import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ExportService } from '@app/services/option/export/export.service';

export enum FilterType {
    NoFilter,
    GrayScale,
    Sepia,
    InvertColor,
    Blur,
    Saturate,
}

interface Filter {
    filterType: FilterType;
    name: string;
    property: string;
}

@Injectable({
    providedIn: 'root',
})
export class FilterService {
    canvas: HTMLCanvasElement;
    private canvasCtx: CanvasRenderingContext2D;

    constructor(private drawingService: DrawingService, private exportService: ExportService) {}

    filters: Filter[] = [
        { filterType: FilterType.NoFilter, name: 'Aucun filtre', property: 'blur(0px) contrast(1) sepia(0) saturate(1) brightness(1) invert(0)' },
        { filterType: FilterType.GrayScale, name: 'Noir et blanc', property: 'grayscale(1)' },
        { filterType: FilterType.Sepia, name: 'Sepia', property: 'sepia(1)' },
        { filterType: FilterType.InvertColor, name: 'Inversion des couleurs', property: 'invert(1)' },
        { filterType: FilterType.Blur, name: 'Embrouillé', property: 'blur(4px)' },
        { filterType: FilterType.Saturate, name: 'Saturé', property: 'saturate(800%)' },
    ];

    applyFilter(filterType: FilterType, canvas: HTMLCanvasElement): void {
        this.canvas = canvas;
        this.canvasCtx = canvas.getContext('2d') as CanvasRenderingContext2D;

        this.resetWithNotFilter();
        this.canvasCtx.filter = this.filters[filterType].property;
        this.canvasCtx.drawImage(this.canvas, 0, 0);

        this.exportService.canvasToExport = this.canvas;
    }

    resetWithNotFilter(): void {
        this.canvasCtx.filter = 'blur(0px) contrast(1) sepia(0) saturate(1) brightness(1) invert(0)';
        this.canvasCtx.drawImage(this.drawingService.canvas, 0, 0);
    }
}
