import { Injectable } from '@angular/core';
import { MouseButton } from '@app/classes/tool';
import { TraceTool } from '@app/classes/trace-tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

const MAX_RGB_VALUE = 255;
const VALUES_PER_PIXEL = 4;

@Injectable({
    providedIn: 'root',
})
export class FillDripService extends TraceTool {
    private higherLimit: Uint8ClampedArray;
    private lowerLimit: Uint8ClampedArray;
    pourcentage: number = 0.5; // TODO: should be in english bro maybe acceptancePercentage ?

    private mainColor: Uint8ClampedArray;

    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService, 'Sceau de peinture');
    }

    onMouseDown(event: MouseEvent): void {
        if (!(event.button === MouseButton.Left) && !(event.button === MouseButton.Right)) return;

        const mousePos: Vec2 = this.getPositionFromMouse(event);

        this.updateMainColor();
        this.getColorRange(mousePos);

        if (event.button === MouseButton.Left) this.contiguousFilling(mousePos);
        if (event.button === MouseButton.Right) this.nonContiguousFilling();
    }

    getColorRange(mousePos: Vec2): void {
        const currentPixel: ImageData = this.drawingService.baseCtx.getImageData(mousePos.x, mousePos.y, 1, 1);

        const highR: number = currentPixel.data[0] + (MAX_RGB_VALUE - currentPixel.data[0]) * this.pourcentage;
        const highG: number = currentPixel.data[1] + (MAX_RGB_VALUE - currentPixel.data[1]) * this.pourcentage;
        const highB: number = currentPixel.data[2] + (MAX_RGB_VALUE - currentPixel.data[2]) * this.pourcentage;
        this.higherLimit = new Uint8ClampedArray([highR, highG, highB]);

        const lowR = currentPixel.data[0] - currentPixel.data[0] * this.pourcentage;
        const lowG = currentPixel.data[1] - currentPixel.data[1] * this.pourcentage;
        const lowB = currentPixel.data[2] - currentPixel.data[2] * this.pourcentage;
        this.lowerLimit = new Uint8ClampedArray([lowR, lowG, lowB]);
    }

    updateMainColor(): void {
        const colorValues: string[] = this.colorService.mainColor.rgbValue.replace('rgb(', '').replace(')', '').split(',');
        const opacity: number = this.colorService.mainColor.opacity;
        this.mainColor = new Uint8ClampedArray([+colorValues[0], +colorValues[1], +colorValues[2], opacity * MAX_RGB_VALUE]);
    }

    inRange(colorData: Uint8ClampedArray): boolean {
        return (
            colorData[0] >= this.lowerLimit[0] &&
            colorData[0] <= this.higherLimit[0] &&
            colorData[1] >= this.lowerLimit[1] &&
            colorData[1] <= this.higherLimit[1] &&
            colorData[2] >= this.lowerLimit[2] &&
            colorData[2] <= this.higherLimit[2]
        );
    }

    // a la place d'update un pixel apres l'autre, former progressivement une image et l'update a la fin
    nonContiguousFilling(): void {
        const pixels: ImageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);

        for (let i = 0; i < pixels.height * pixels.width * VALUES_PER_PIXEL; i += VALUES_PER_PIXEL) {
            if (this.inRange(pixels.data.slice(i, i + VALUES_PER_PIXEL))) {
                pixels.data.set(this.mainColor, i);
            }
        }
        this.drawingService.baseCtx.putImageData(pixels, 0, 0);
    }

    areEqualColors(colorA: Uint8ClampedArray, colorB: Uint8ClampedArray): boolean {
        return colorA[0] === colorB[0] && colorA[1] === colorB[1] && colorA[2] === colorB[2];
    }

    contiguousFilling(mousePos: Vec2): void {
        const linearMousePos = mousePos.y * this.drawingService.canvas.width + mousePos.x;

        const pixels: ImageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);

        const neighbors: number[] = [linearMousePos];

        const searchedPixels: boolean[] = [];
        for (let i = 0; i < this.drawingService.canvas.width * this.drawingService.canvas.height; i++) {
            searchedPixels.push(false);
        }
        searchedPixels[linearMousePos] = true;

        while (neighbors.length !== 0) {
            pixels.data.set(this.mainColor, neighbors[0] * VALUES_PER_PIXEL);

            this.getValidNeighbors(pixels.data, neighbors, searchedPixels);

            neighbors.shift();
        }

        this.drawingService.baseCtx.putImageData(pixels, 0, 0);
    }

    getValidNeighbors(pixelsData: Uint8ClampedArray, neighbors: number[], searchedPixels: boolean[]): void {
        const currentPos: number = neighbors[0];

        const possibleNeighbors: number[] = [];
        if (currentPos > 0) possibleNeighbors.push(currentPos - 1);
        if (currentPos < this.drawingService.canvas.width * this.drawingService.canvas.height - 1) possibleNeighbors.push(currentPos + 1);
        if (currentPos >= this.drawingService.canvas.width) possibleNeighbors.push(currentPos - this.drawingService.canvas.width);
        if (currentPos < this.drawingService.canvas.height * this.drawingService.canvas.width - this.drawingService.canvas.width - 1)
            possibleNeighbors.push(currentPos + this.drawingService.canvas.width);

        for (const pos of possibleNeighbors) {
            const currentPixel: Uint8ClampedArray = pixelsData.slice(pos * VALUES_PER_PIXEL, pos * VALUES_PER_PIXEL + VALUES_PER_PIXEL);
            if (this.inRange(currentPixel) && !this.areEqualColors(currentPixel, this.mainColor) && searchedPixels[pos] === false) {
                neighbors.push(pos);
                searchedPixels[pos] = true;
            }
        }
    }
}
