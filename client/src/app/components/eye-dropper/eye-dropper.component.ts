import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ColorService } from '@app/services/color/color.service';
import { EyeDropperService } from '@app/services/tools/eye-dropper/eye-dropper.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-eye-dropper',
    templateUrl: './eye-dropper.component.html',
    styleUrls: ['./eye-dropper.component.scss'],
})
export class EyeDropperComponent {
    @ViewChild('eyeDropperCanvas', { static: false }) eyeDropperCanvasRef: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvas', { static: false }) gridCanvasRef: ElementRef<HTMLCanvasElement>;

    readonly previewCanvasSize: number = 20;
    readonly canvasRealSize: number = 250;
    readonly POSITION_0: number = 0;
    readonly POSITION_1: number = 1;
    readonly POSITION_2: number = 2;
    readonly POSITION_3: number = 3;
    readonly gridAlpha: number = 0.25;
    readonly rgbMaxValue: number = 255;
    readonly scaling: number = 22.72727272;
    readonly haftTheSize: number = 5.5;

    subscription: Subscription;
    private eyeDropperCanvas: HTMLCanvasElement;
    private eyeDropperCtx: CanvasRenderingContext2D;
    private gridCtx: CanvasRenderingContext2D;

    constructor(private eyeDropperService: EyeDropperService, private colorService: ColorService) {
        this.subscription = this.eyeDropperService.newIncomingColor().subscribe(() => {
            this.newColorNotification();
        });
    }

    newColorNotification(): void {
        const red = this.eyeDropperService.currentPixelData.data[this.POSITION_0];
        const green = this.eyeDropperService.currentPixelData.data[this.POSITION_1];
        const blue = this.eyeDropperService.currentPixelData.data[this.POSITION_2];
        const alpha = this.eyeDropperService.currentPixelData.data[this.POSITION_3] / this.rgbMaxValue;
        const updateColor = { rgbValue: 'rgb(' + red + ',' + green + ',' + blue + ')', opacity: alpha };
        if (this.eyeDropperService.leftClick) this.colorService.updateColor(this.colorService.mainColor, updateColor);
        else this.colorService.updateColor(this.colorService.secondaryColor, updateColor);
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (this.eyeDropperService.preview) {
            this.eyeDropperCanvas = this.eyeDropperCanvasRef.nativeElement;
            this.eyeDropperCtx = this.eyeDropperCanvas.getContext('2d') as CanvasRenderingContext2D;
            this.gridCtx = this.gridCanvasRef.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            if (!this.eyeDropperService.gridDrawn) this.drawGrid();
            this.buildImage();
        }
    }

    buildImage(): void {
        this.eyeDropperCtx.save();
        const image = document.createElement('canvas');
        image.width = this.canvasRealSize;
        image.height = this.canvasRealSize;
        (image.getContext('2d') as CanvasRenderingContext2D).putImageData(this.eyeDropperService.currentGridOfPixelData, 0, 0);
        this.eyeDropperCtx.scale(this.scaling, this.scaling);
        this.eyeDropperCtx.beginPath();
        this.eyeDropperCtx.ellipse(this.haftTheSize, this.haftTheSize, this.haftTheSize, this.haftTheSize, 0, 0, 2 * Math.PI);
        this.eyeDropperCtx.clip();
        this.eyeDropperCtx.imageSmoothingEnabled = false;
        this.eyeDropperCtx.drawImage(image, 0, 0);
        this.eyeDropperCtx.restore();
    }

    drawGrid(): void {
        this.eyeDropperService.gridDrawn = true;
        const tmpDimension = this.scaling;
        this.gridCtx.lineWidth = 1;
        this.gridCtx.strokeStyle = 'black';

        this.gridCtx.globalAlpha = 1;
        this.gridCtx.lineWidth = 1 + 1 + 1 + 1;
        this.gridCtx.ellipse(
            this.canvasRealSize / 2,
            this.canvasRealSize / 2,
            this.canvasRealSize / 2 - 1,
            this.canvasRealSize / 2 - 1,
            0,
            0,
            2 * Math.PI,
        );
        this.gridCtx.stroke();
        this.gridCtx.lineWidth = 1;
        this.gridCtx.globalAlpha = this.gridAlpha;

        this.gridCtx.beginPath();
        this.gridCtx.ellipse(this.canvasRealSize / 2, this.canvasRealSize / 2, this.canvasRealSize / 2, this.canvasRealSize / 2, 0, 0, 2 * Math.PI);
        this.gridCtx.clip();

        for (let x = 0; x < this.canvasRealSize; x += tmpDimension) {
            for (let y = 0; y < this.canvasRealSize; y += tmpDimension) {
                this.gridCtx.strokeRect(x, y, tmpDimension, tmpDimension);
            }
        }
        this.gridCtx.globalAlpha = 1;

        const centerPosition = 1 + 1 + 1 + 1 + 1;
        this.gridCtx.strokeRect(tmpDimension * centerPosition, tmpDimension * centerPosition, tmpDimension, tmpDimension);
    }
}
