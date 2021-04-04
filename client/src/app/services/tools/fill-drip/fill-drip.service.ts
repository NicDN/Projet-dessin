import { Injectable } from '@angular/core';
import { MouseButton } from '@app/classes/tool';
import { TraceTool } from '@app/classes/trace-tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

const MAX_RGB_VALUE = 255;

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
        for (let i = 0; i < this.drawingService.canvas.width; i++) {
            for (let j = 0; j < this.drawingService.canvas.height; j++) {
                const pixel = this.drawingService.baseCtx.getImageData(i, j, 1, 1);
                if (this.inRange(pixel.data)) {
                    pixel.data.set(this.mainColor);
                    this.drawingService.baseCtx.putImageData(pixel, i, j);
                }
            }
        }
    }

    areEqualColors(colorA: Uint8ClampedArray, colorB: Uint8ClampedArray): boolean {
        return colorA[0] === colorB[0] && colorA[1] === colorB[1] && colorA[2] === colorB[2];
    }

    contiguousFilling(mousePos: Vec2): void {
        const neighbors: ImageData[] = [this.drawingService.baseCtx.getImageData(mousePos.x, mousePos.y, 1, 1)];
        const neighborsPos: Vec2[] = [mousePos];

        while (neighbors.length !== 0) {
            neighbors[0].data.set(this.mainColor);
            this.drawingService.baseCtx.putImageData(neighbors[0], neighborsPos[0].x, neighborsPos[0].y);
            this.getValidNeighbors(neighbors, neighborsPos);
            neighbors.shift();
            neighborsPos.shift();
        }
    }

    getValidNeighbors(neighbors: ImageData[], neighborsPos: Vec2[]): void {
        const currentPos: Vec2 = neighborsPos[0];
        const neighborsIdx: Vec2[] = [];
        if (currentPos.x > 0) neighborsIdx.push({ x: currentPos.x - 1, y: currentPos.y });
        if (currentPos.x < this.drawingService.canvas.width - 1) neighborsIdx.push({ x: currentPos.x + 1, y: currentPos.y });
        if (currentPos.y > 0) neighborsIdx.push({ x: currentPos.x, y: currentPos.y - 1 });
        if (currentPos.y < this.drawingService.canvas.height - 1) neighborsIdx.push({ x: currentPos.x, y: currentPos.y + 1 });

        for (const pos of neighborsIdx) {
            const neighbor: ImageData = this.drawingService.baseCtx.getImageData(pos.x, pos.y, 1, 1);
            if (this.inRange(neighbor.data) && !this.areEqualColors(neighbor.data, this.mainColor) && !neighbors.includes(neighbor)) {
                neighbors.push(neighbor);
                neighborsPos.push(pos);
            }
        }
    }
}
