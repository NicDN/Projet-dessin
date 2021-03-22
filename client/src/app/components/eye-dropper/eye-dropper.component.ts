import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Color } from '@app/classes/color';
import { ColorService } from '@app/services/color/color.service';
import { EyeDropperService } from '@app/services/tools/eye-dropper/eye-dropper.service';

@Component({
    selector: 'app-eye-dropper',
    templateUrl: './eye-dropper.component.html',
    styleUrls: ['./eye-dropper.component.scss'],
})
export class EyeDropperComponent implements OnInit {
    @ViewChild('eyeDropperCanvas', { static: false }) eyeDropperCanvasRef: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvas', { static: false }) gridCanvasRef: ElementRef<HTMLCanvasElement>;

    private readonly CANVAS_SIZE: number = 250;
    private readonly POSITION_0: number = 0;
    private readonly POSITION_1: number = 1;
    private readonly POSITION_2: number = 2;
    private readonly POSITION_3: number = 3;
    private readonly GRID_ALPHA: number = 0.25;
    private readonly MAX_RGB_VALUE: number = 255;
    private readonly SCALING: number = 22.72727272;
    private readonly SIZE_PREVIEW: number = 11;
    private readonly CENTER_POSITION: number = 5;
    private readonly LINE_GRID_WIDTH: number = 4;

    private eyeDropperCanvas: HTMLCanvasElement;
    private eyeDropperCtx: CanvasRenderingContext2D;
    private gridCtx: CanvasRenderingContext2D;

    constructor(private eyeDropperService: EyeDropperService, private colorService: ColorService) {}

    ngOnInit(): void {
        this.eyeDropperService.newIncomingColor().subscribe(() => {
            this.newColorNotification();
        });
    }

    private newColorNotification(): void {
        const red = this.eyeDropperService.currentPixelData.data[this.POSITION_0];
        const green = this.eyeDropperService.currentPixelData.data[this.POSITION_1];
        const blue = this.eyeDropperService.currentPixelData.data[this.POSITION_2];
        const alpha = this.eyeDropperService.currentPixelData.data[this.POSITION_3] / this.MAX_RGB_VALUE;
        const updateColor = { rgbValue: 'rgb(' + red + ',' + green + ',' + blue + ')', opacity: alpha };
        this.changeColor(updateColor);
    }

    private changeColor(color: Color): void {
        this.eyeDropperService.isLeftClick
            ? this.colorService.updateColor(this.colorService.mainColor, color)
            : this.colorService.updateColor(this.colorService.secondaryColor, color);
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (this.eyeDropperService.previewIsDisplayed) {
            this.eyeDropperCanvas = this.eyeDropperCanvasRef.nativeElement;
            this.eyeDropperCtx = this.eyeDropperCanvas.getContext('2d') as CanvasRenderingContext2D;
            this.gridCtx = this.gridCanvasRef.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.drawGrid();
            this.buildImage();
        }
    }

    private buildImage(): void {
        this.eyeDropperCtx.save();
        this.setContextForPreview();
        this.eyeDropperCtx.clearRect(0, 0, this.CANVAS_SIZE, this.CANVAS_SIZE);
        const image = this.makeImageForPreview();
        this.makePreviewCircular(this.SIZE_PREVIEW, this.eyeDropperCtx);
        this.eyeDropperCtx.drawImage(image, 0, 0);
        this.eyeDropperCtx.restore();
    }

    private makeImageForPreview(): HTMLCanvasElement {
        const image = document.createElement('canvas');
        image.width = this.CANVAS_SIZE;
        image.height = this.CANVAS_SIZE;
        (image.getContext('2d') as CanvasRenderingContext2D).putImageData(this.eyeDropperService.currentGridOfPixelData, 0, 0);
        return image;
    }

    private setContextForPreview(): void {
        this.eyeDropperCtx.imageSmoothingEnabled = false;
        this.eyeDropperCtx.scale(this.SCALING, this.SCALING);
    }

    private drawGrid(): void {
        this.gridCtx.clearRect(0, 0, this.CANVAS_SIZE, this.CANVAS_SIZE);

        this.drawBlackCircleAroundPreview();
        this.makePreviewCircular(this.CANVAS_SIZE, this.gridCtx);

        this.gridCtx.save();
        this.setGridContext();
        for (let x = 0; x < this.CANVAS_SIZE; x += this.SCALING) {
            for (let y = 0; y < this.CANVAS_SIZE; y += this.SCALING) {
                this.gridCtx.strokeRect(x, y, this.SCALING, this.SCALING);
            }
        }
        this.gridCtx.globalAlpha = 1;
        this.gridCtx.strokeRect(this.SCALING * this.CENTER_POSITION, this.SCALING * this.CENTER_POSITION, this.SCALING, this.SCALING);
        this.gridCtx.restore();
    }

    private makePreviewCircular(size: number, ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.ellipse(size / 2, size / 2, size / 2, size / 2, 0, 0, 2 * Math.PI);
        ctx.clip();
    }

    private setGridContext(): void {
        this.gridCtx.strokeStyle = 'black';
        this.gridCtx.lineWidth = 1;
        this.gridCtx.globalAlpha = this.GRID_ALPHA;
    }

    private drawBlackCircleAroundPreview(): void {
        this.gridCtx.save();
        this.gridCtx.globalAlpha = 1;
        this.gridCtx.lineWidth = this.LINE_GRID_WIDTH;
        this.gridCtx.ellipse(this.CANVAS_SIZE / 2, this.CANVAS_SIZE / 2, this.CANVAS_SIZE / 2 - 1, this.CANVAS_SIZE / 2 - 1, 0, 0, 2 * Math.PI);
        this.gridCtx.stroke();
        this.gridCtx.restore();
    }
}
