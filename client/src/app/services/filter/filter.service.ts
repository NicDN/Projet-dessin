import { ElementRef, Injectable } from '@angular/core';

import { DrawingService } from '@app/services/drawing/drawing.service';

export enum FilterType {
    NoFilter,
    GrayScale,
    Brightness,
    InvertColor,
    RedGreenBlue,
    Blur,
}

const NEXT_PIXEL = 4;
const RED_GREY_RATIO = 0.3;
const GREEN_GREY_RATIO = 0.59;
const BLUE_GREY_RATIO = 0.11;

@Injectable({
    providedIn: 'root',
})
export class FilterService {
    canvas: ElementRef<HTMLCanvasElement>;
    canvasCtx: CanvasRenderingContext2D;

    constructor(private drawingService: DrawingService) {}

    applyFilter(filter: FilterType, canvas: ElementRef<HTMLCanvasElement>): void {
        this.canvas = canvas;
        this.canvasCtx = canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;

        switch (filter) {
            case FilterType.NoFilter:
                this.resetWithNotFilter();
                break;
            case FilterType.GrayScale:
                this.grayScale();
                break;
            case FilterType.Brightness:
                this.brightnessFilter();
                break;
            case FilterType.InvertColor:
                this.invertingColorFilter();
                break;
            case FilterType.RedGreenBlue:
                this.redGreenBlueFilter();
                break;
            case FilterType.Blur:
                this.blurFilter();
                break;
        }
    }

    grayScale(): void {
        // Reference https://www.htmlgoodies.com/html5/javascript/display-images-in-black-and-white-using-the-html5-canvas.html
        this.resetWithNotFilter();
        const imgData = this.canvasCtx.getImageData(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
        const pixels = imgData.data;
        const numberOfPixels = pixels.length;
        for (let i = 0; i < numberOfPixels; i += NEXT_PIXEL) {
            const grayscale = pixels[i] * RED_GREY_RATIO + pixels[i + 1] * GREEN_GREY_RATIO + pixels[i + 2] * BLUE_GREY_RATIO;
            pixels[i] = grayscale;
            pixels[i + 1] = grayscale;
            pixels[i + 2] = grayscale;
        }
        // redraw the image in black & white
        this.canvasCtx.putImageData(imgData, 0, 0);
    }

    brightnessFilter(): void {
        this.resetWithNotFilter();
        const imgData = this.canvasCtx.getImageData(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
        const pixels = imgData.data;
        const numberOfPixels = pixels.length;
        const adjustement = 60;
        for (let i = 0; i < numberOfPixels; i += NEXT_PIXEL) {
            pixels[i] += adjustement;
            pixels[i + 1] += adjustement;
            pixels[i + 2] += adjustement;
        }
        this.canvasCtx.putImageData(imgData, 0, 0);
    }

    invertingColorFilter(): void {
        this.resetWithNotFilter();
        const imgData = this.canvasCtx.getImageData(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
        const pixels = imgData.data;
        const numberOfPixels = pixels.length;
        const maxValue = 255;
        for (let i = 0; i < numberOfPixels; i += NEXT_PIXEL) {
            pixels[i] = maxValue - pixels[i];
            pixels[i + 1] = maxValue - pixels[i + 1];
            pixels[i + 2] = maxValue - pixels[i + 2];
        }
        this.canvasCtx.putImageData(imgData, 0, 0);
    }

    redGreenBlueFilter(): void {
        this.resetWithNotFilter();
        const imgData = this.canvasCtx.getImageData(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
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
        this.canvasCtx.putImageData(imgData, 0, 0);
    }

    blurFilter(): void {
        this.resetWithNotFilter();
        this.canvas.nativeElement.style.filter = 'blur(2px)';
    }

    resetWithNotFilter(): void {
        this.canvas.nativeElement.style.filter = 'blur(0px)';
        this.canvasCtx.drawImage(this.drawingService.canvas, 0, 0);
    }
}
