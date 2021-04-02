import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class StampService extends Tool {
    stamps: string[] = [
        ' ../../../../../assets/stamps/catKun.jpg',
        ' ../../../../../assets/stamps/github.png',
        ' ../../../../../assets/stamps/mario.jpeg',
        ' ../../../../../assets/stamps/emoji.png',
        ' ../../../../../assets/stamps/minecraft.png',
        ' ../../../../../assets/stamps/creeper.png',
    ];

    selectedStampSrc: string = this.stamps[0];

    readonly SCALING_MAX_VALUE: number = 3;
    readonly SCALING_MIN_VALUE: number = 0.1;

    readonly ANGLE_MAX_VALUE: number = 360;
    readonly ANGLE_MIN_VALUE: number = 0;
    readonly RADIAN_DEGREE_RATIO: number = 180;
    readonly DEFAULT_SCROLL_ANGLE_CHANGE: number = 15;
    readonly ALT_SCROLL_ANGLE_CHANGE: number = 1;

    private angleIncrement: number = 15;
    wheelScroll: number = 0;
    scaling: number = 10;
    realScaling: number = 1;
    angle: number = this.ANGLE_MIN_VALUE;

    constructor(drawingService: DrawingService) {
        super(drawingService, 'Étampe');
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.displayPreview(event);
    }

    private displayPreview(event: MouseEvent): void {
        this.drawImageOnCanvas(event, this.drawingService.previewCtx);
    }

    onMouseDown(event: MouseEvent): void {
        this.drawImageOnCanvas(event, this.drawingService.baseCtx);
    }

    private drawImageOnCanvas(event: MouseEvent, ctx: CanvasRenderingContext2D): void {
        const stampPreview: HTMLImageElement = new Image();
        stampPreview.src = this.selectedStampSrc;
        const mousePosition = this.getPositionFromMouse(event);

        ctx.save();
        const currentCoords = this.getPositionFromMouse(event);
        ctx.translate(currentCoords.x, currentCoords.y);
        ctx.rotate(this.angle);
        ctx.translate(-currentCoords.x, -currentCoords.y);
        this.scaling = this.scaling;
        this.realScaling = this.scaling / 10;
        ctx.drawImage(
            stampPreview,
            mousePosition.x - Math.floor((stampPreview.width * this.realScaling) / 2),
            mousePosition.y - Math.floor((stampPreview.height * this.realScaling) / 2),
            stampPreview.width * this.realScaling,
            stampPreview.height * this.realScaling,
        );
        ctx.restore();
    }

    onScroll(event: WheelEvent): void {
        this.rotateStamp(event);
    }

    rotateStamp(event: WheelEvent): void {
        if (event.deltaY > 0) {
            console.log(this.angleIncrement);
            this.wheelScroll += this.angleIncrement;
        } else {
            this.wheelScroll -= this.angleIncrement;
        }
        console.log(this.wheelScroll);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.angle = (this.wheelScroll * Math.PI) / this.RADIAN_DEGREE_RATIO;
        this.drawImageOnCanvas(event, this.drawingService.previewCtx);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.altKey) {
            this.angleIncrement = this.ALT_SCROLL_ANGLE_CHANGE;
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        this.angleIncrement = this.DEFAULT_SCROLL_ANGLE_CHANGE;
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
}
