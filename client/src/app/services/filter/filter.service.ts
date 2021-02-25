import { ElementRef, Injectable } from '@angular/core';
import { DrawingService } from '../drawing/drawing.service';

export enum FilterType {
    NoFilter,
    GrayScale,
    Sepia,
    InvertColor,
    Blur,
    Saturate,
}

// type FilterManager = {
//     [key in FilterType]: string;
// };
@Injectable({
    providedIn: 'root',
})
export class FilterService {
    canvas: ElementRef<HTMLCanvasElement>;
    // filterManager: FilterManager;
    private canvasCtx: CanvasRenderingContext2D;

    constructor(private drawingService: DrawingService) {}

    applyFilter(filter: FilterType, canvas: ElementRef<HTMLCanvasElement>): void {
        this.canvas = canvas;
        this.canvasCtx = canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;

        this.resetWithNotFilter();

        switch (filter) {
            case FilterType.NoFilter:
                this.canvasCtx.filter = 'blur(0px) contrast(1) sepia(0) saturate(1)';
                break;
            case FilterType.GrayScale:
                this.canvasCtx.filter = 'grayscale(1)';
                break;
            case FilterType.Sepia:
                this.canvasCtx.filter = 'contrast(1.4) sepia(1)';
                break;
            case FilterType.InvertColor:
                this.canvasCtx.filter = 'invert(1)';
                break;
            case FilterType.Blur:
                this.canvasCtx.filter = 'blur(4px)';
                break;
            case FilterType.Saturate:
                this.canvasCtx.filter = 'saturate(0.15)';
                break;
        }
        this.canvasCtx.drawImage(this.canvas.nativeElement, 0, 0);
    }

    resetWithNotFilter(): void {
        this.canvasCtx.filter = 'blur(0px) contrast(1) sepia(0) saturate(1)';
        this.canvasCtx.drawImage(this.drawingService.canvas, 0, 0);
    }
}
