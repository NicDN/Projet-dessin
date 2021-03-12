import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ColorService } from '@app/services/color/color.service';
import { EyeDropperService } from '@app/services/tools/eye-dropper/eye-dropper.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-eye-dropper',
    templateUrl: './eye-dropper.component.html',
    styleUrls: ['./eye-dropper.component.scss'],
})
export class EyeDropperComponent implements AfterViewInit {
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

    subscription: Subscription;
    private eyeDropperCanvas: HTMLCanvasElement;
    private eyeDropperCtx: CanvasRenderingContext2D;
    private gridCtx: CanvasRenderingContext2D;

    constructor(private eyeDropperService: EyeDropperService, private colorService: ColorService) {
        this.subscription = this.eyeDropperService.newIncomingColor().subscribe(() => {
            this.newColorNotification();
        });
    }

    ngAfterViewInit(): void {
        this.eyeDropperCanvas = this.eyeDropperCanvasRef.nativeElement;
        this.eyeDropperCtx = this.eyeDropperCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.gridCtx = this.gridCanvasRef.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawGrid();
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
        this.eyeDropperCtx.scale(2, 2);
        this.eyeDropperCtx.putImageData(this.eyeDropperService.currentGridOfPixelData, 0, 0);
        this.buildImage();
    }

    buildImage(): void {
        const image = this.eyeDropperCtx.getImageData(0, 0, this.canvasRealSize, this.canvasRealSize);
        this.eyeDropperCtx.putImageData(image, 0, 0);
    }

    drawGrid(): void {
        const tmpDimension = 25;
        this.gridCtx.lineWidth = 1;
        this.gridCtx.strokeStyle = 'black';
        this.gridCtx.globalAlpha = this.gridAlpha;
        for (let x = 0; x < this.canvasRealSize; x += tmpDimension) {
            for (let y = 0; y < this.canvasRealSize; y += tmpDimension) {
                this.gridCtx.strokeRect(x, y, tmpDimension, tmpDimension);
            }
        }
        this.gridCtx.globalAlpha = 1;
        const centerPosition = 5;
        this.gridCtx.strokeRect(tmpDimension * centerPosition, tmpDimension * centerPosition, tmpDimension, tmpDimension);
    }

    // we might not want this cause we don't wanna click on the sidebar for the color
    // getPreviewColor(event: MouseEvent): void {
    //     // Needs this because the coordinates of the zoomed canvas are incorrect
    //     const zoomedX = (this.previewCanvasSize * event.offsetX) / this.canvasRealSize;
    //     const zoomedY = (this.previewCanvasSize * event.offsetY) / this.canvasRealSize;
    //     const newColor = this.eyeDropperCtx.getImageData(zoomedX, zoomedY, 1, 1);

    //     const red = newColor.data[this.POSITION_0];
    //     const green = newColor.data[this.POSITION_1];
    //     const blue = newColor.data[this.POSITION_2];
    //     const alpha = newColor.data[this.POSITION_3];

    //     if (event.button === MouseButton.Right) event.preventDefault();
    //     this.eyeDropperService.leftClick = event.button === MouseButton.Left;
    //     const updateColor = { rgbValue: 'rgb(' + red + ',' + green + ',' + blue + ')', opacity: alpha };
    //     if (this.eyeDropperService.leftClick) this.colorService.updateColor(this.colorService.mainColor, updateColor);
    //     else this.colorService.updateColor(this.colorService.secondaryColor, updateColor);
    // }
}
