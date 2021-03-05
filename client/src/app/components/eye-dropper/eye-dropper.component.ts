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
    subscription: Subscription;
    private eyeDropperCanvas: HTMLCanvasElement;
    private eyeDropperCtx: CanvasRenderingContext2D;
    constructor(private eyeDropperService: EyeDropperService, private colorSerivce: ColorService) {
        this.subscription = this.eyeDropperService.newIncomingColor().subscribe(() => {
            this.newColorNotification();
        });
    }

    ngAfterViewInit(): void {
        this.eyeDropperCanvas = this.eyeDropperCanvasRef.nativeElement;
        this.eyeDropperCtx = this.eyeDropperCanvas.getContext('2d') as CanvasRenderingContext2D;
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
        this.eyeDropperCtx.save();
        this.eyeDropperCtx.beginPath();
        this.eyeDropperCtx.arc(0, 0, 5, 0, Math.PI * 2, true);
        this.eyeDropperCtx.closePath();
        this.eyeDropperCtx.clip();
        const image = this.eyeDropperCtx.getImageData(0, 0, 250, 250);
        this.eyeDropperCtx.putImageData(image, 0, 0);
    }
}
