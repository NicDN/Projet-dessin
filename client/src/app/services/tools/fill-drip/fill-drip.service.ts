import { Injectable } from '@angular/core';
import { FillDripCommand, FillDripProperties } from '@app/classes/commands/fill-drip-command/fill-drip-command';
import { MouseButton } from '@app/classes/tool';
import { TraceTool } from '@app/classes/trace-tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

const MAX_RGB_VALUE = 255;
const VALUES_PER_PIXEL = 4;

@Injectable({
    providedIn: 'root',
})
export class FillDripService extends TraceTool {
    private higherLimit: Uint8ClampedArray;
    private lowerLimit: Uint8ClampedArray;
    acceptancePercentage: number = 0.5;
    private mainColor: Uint8ClampedArray;

    constructor(drawingService: DrawingService, colorService: ColorService, private undoRedoService: UndoRedoService) {
        super(drawingService, colorService, 'Sceau de peinture');
    }

    onMouseDown(event: MouseEvent): void {
        if (!(event.button === MouseButton.Left) && !(event.button === MouseButton.Right)) return;

        const mousePos: Vec2 = this.getPositionFromMouse(event);

        this.updateMainColor();
        this.getColorRange(mousePos);

        if (event.button === MouseButton.Left) this.registerFillDripCommand(mousePos, true);
        if (event.button === MouseButton.Right) this.registerFillDripCommand(mousePos, false);
    }

    private registerFillDripCommand(mousePosition: Vec2, isContiguous: boolean): void {
        const pixels: ImageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        const fillDripCommand = new FillDripCommand(this, this.loadFillDripPropreties(isContiguous, mousePosition, pixels));
        fillDripCommand.execute();
        this.undoRedoService.addCommand(fillDripCommand);
    }

    private loadFillDripPropreties(isContiguous: boolean, mousePos: Vec2, img: ImageData): FillDripProperties {
        return {
            ctx: this.drawingService.baseCtx,
            data: img,
            mousePosition: mousePos,
            isContiguous,
            mainColor: this.mainColor,
            acceptancePercentage: this.acceptancePercentage,
            higherLimit: this.higherLimit,
            lowerLimit: this.lowerLimit,
        };
    }

    private getColorRange(mousePos: Vec2): void {
        const currentPixel: ImageData = this.drawingService.baseCtx.getImageData(mousePos.x, mousePos.y, 1, 1);

        const highR: number = currentPixel.data[0] + (MAX_RGB_VALUE - currentPixel.data[0]) * this.acceptancePercentage;
        const highG: number = currentPixel.data[1] + (MAX_RGB_VALUE - currentPixel.data[1]) * this.acceptancePercentage;
        const highB: number = currentPixel.data[2] + (MAX_RGB_VALUE - currentPixel.data[2]) * this.acceptancePercentage;
        this.higherLimit = new Uint8ClampedArray([highR, highG, highB]);

        const lowR = currentPixel.data[0] - currentPixel.data[0] * this.acceptancePercentage;
        const lowG = currentPixel.data[1] - currentPixel.data[1] * this.acceptancePercentage;
        const lowB = currentPixel.data[2] - currentPixel.data[2] * this.acceptancePercentage;
        this.lowerLimit = new Uint8ClampedArray([lowR, lowG, lowB]);
    }

    private updateMainColor(): void {
        const colorValues: string[] = this.colorService.mainColor.rgbValue.replace('rgb(', '').replace(')', '').split(',');
        const opacity: number = this.colorService.mainColor.opacity;
        this.mainColor = new Uint8ClampedArray([+colorValues[0], +colorValues[1], +colorValues[2], opacity * MAX_RGB_VALUE]);
    }

    private inRange(colorData: Uint8ClampedArray, higherLimit: Uint8ClampedArray, lowerLimit: Uint8ClampedArray): boolean {
        return (
            colorData[0] >= lowerLimit[0] &&
            colorData[0] <= higherLimit[0] &&
            colorData[1] >= lowerLimit[1] &&
            colorData[1] <= higherLimit[1] &&
            colorData[2] >= lowerLimit[2] &&
            colorData[2] <= higherLimit[2]
        );
    }

    nonContiguousFilling(fillDripProperties: FillDripProperties): void {
        for (let i = 0; i < fillDripProperties.data.height * fillDripProperties.data.width * VALUES_PER_PIXEL; i += VALUES_PER_PIXEL) {
            if (
                this.inRange(
                    fillDripProperties.data.data.slice(i, i + VALUES_PER_PIXEL),
                    fillDripProperties.higherLimit,
                    fillDripProperties.lowerLimit,
                )
            ) {
                fillDripProperties.data.data.set(fillDripProperties.mainColor, i);
            }
        }
        this.drawingService.baseCtx.putImageData(fillDripProperties.data, 0, 0);
    }

    private areEqualColors(colorA: Uint8ClampedArray, colorB: Uint8ClampedArray): boolean {
        return colorA[0] === colorB[0] && colorA[1] === colorB[1] && colorA[2] === colorB[2];
    }

    contiguousFilling(fillDripProperties: FillDripProperties): void {
        const linearMousePos = fillDripProperties.mousePosition.y * this.drawingService.canvas.width + fillDripProperties.mousePosition.x;
        const neighbors: number[] = [linearMousePos];

        const searchedPixels: boolean[] = [];
        for (let i = 0; i < this.drawingService.canvas.width * this.drawingService.canvas.height; i++) {
            searchedPixels.push(false);
        }
        searchedPixels[linearMousePos] = true;

        while (neighbors.length !== 0) {
            fillDripProperties.data.data.set(fillDripProperties.mainColor, neighbors[0] * VALUES_PER_PIXEL);

            this.getValidNeighbors(
                fillDripProperties.data.data,
                neighbors,
                searchedPixels,
                fillDripProperties.mainColor,
                fillDripProperties.higherLimit,
                fillDripProperties.lowerLimit,
            );

            neighbors.shift();
        }

        this.drawingService.baseCtx.putImageData(fillDripProperties.data, 0, 0);
    }

    private getValidNeighbors(
        pixelsData: Uint8ClampedArray,
        neighbors: number[],
        searchedPixels: boolean[],
        mainColor: Uint8ClampedArray,
        higherLimit: Uint8ClampedArray,
        lowerLimit: Uint8ClampedArray,
    ): void {
        const currentPos: number = neighbors[0];

        const possibleNeighbors: number[] = [];
        if (currentPos > 0) possibleNeighbors.push(currentPos - 1);
        if (currentPos < this.drawingService.canvas.width * this.drawingService.canvas.height - 1) possibleNeighbors.push(currentPos + 1);
        if (currentPos >= this.drawingService.canvas.width) possibleNeighbors.push(currentPos - this.drawingService.canvas.width);
        if (currentPos < this.drawingService.canvas.height * this.drawingService.canvas.width - this.drawingService.canvas.width - 1)
            possibleNeighbors.push(currentPos + this.drawingService.canvas.width);

        for (const pos of possibleNeighbors) {
            const currentPixel: Uint8ClampedArray = pixelsData.slice(pos * VALUES_PER_PIXEL, pos * VALUES_PER_PIXEL + VALUES_PER_PIXEL);
            if (
                this.inRange(currentPixel, higherLimit, lowerLimit) &&
                !this.areEqualColors(currentPixel, mainColor) &&
                searchedPixels[pos] === false
            ) {
                neighbors.push(pos);
                searchedPixels[pos] = true;
            }
        }
    }
}
