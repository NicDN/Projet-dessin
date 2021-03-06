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

    subscription: Subscription;
    private eyeDropperCanvas: HTMLCanvasElement;
    private eyeDropperCtx: CanvasRenderingContext2D;
    private gridCtx: CanvasRenderingContext2D;
    constructor(private eyeDropperService: EyeDropperService, private colorSerivce: ColorService) {
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
        const red = this.eyeDropperService.currentPixelData.data[0];
        const green = this.eyeDropperService.currentPixelData.data[1];
        const blue = this.eyeDropperService.currentPixelData.data[2];
        const alpha = this.eyeDropperService.currentPixelData.data[3];
        this.eyeDropperCtx.scale(2, 2);
        const updateColor = { rgbValue: 'rgb(' + red + ',' + green + ',' + blue + ')', opacity: alpha };
        this.colorSerivce.updateColor(this.colorSerivce.mainColor, updateColor);
        this.eyeDropperCtx.putImageData(this.eyeDropperService.currentGridOfPixelData, 0, 0);
        this.buildImage();
    }

    @HostListener('window:mouseUp', ['$event'])
    onMouseUp(event: MouseEvent): void {
        // Something will be done here
    }

    buildImage(): void {
        const image = this.eyeDropperCtx.getImageData(0, 0, this.canvasRealSize, this.canvasRealSize);
        this.eyeDropperCtx.putImageData(image, 0, 0);
    }

    getPreviewColor(event: MouseEvent): void {
        // Needs this because the coordinates of the zoomed canvas are incorrect
        const zoomedX = (this.previewCanvasSize * event.offsetX) / this.canvasRealSize;
        const zoomedY = (this.previewCanvasSize * event.offsetY) / this.canvasRealSize;
        const newColor = this.eyeDropperCtx.getImageData(zoomedX, zoomedY, 1, 1);

        const red = newColor.data[0];
        const green = newColor.data[1];
        const blue = newColor.data[2];
        const alpha = newColor.data[3];

        const updateColor = { rgbValue: 'rgb(' + red + ',' + green + ',' + blue + ')', opacity: alpha };
        this.colorSerivce.updateColor(this.colorSerivce.mainColor, updateColor);
    }

    drawGrid(): void {
        const half = 0.5;
        const tmpDimension = 10;
        this.gridCtx.lineWidth = 1;
        this.gridCtx.strokeStyle = 'black';
        this.gridCtx.globalAlpha = half;
        for (let x = 0; x < this.canvasRealSize; x += tmpDimension) {
            for (let y = 0; y < this.canvasRealSize; y += tmpDimension) {
                this.gridCtx.strokeRect(x, y, tmpDimension, tmpDimension);
            }
        }
    }
}
