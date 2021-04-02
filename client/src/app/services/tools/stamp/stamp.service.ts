import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { StampCommand, StampPropreties } from './../../../classes/commands/stamp-command/stamp-command';
import { UndoRedoService } from './../../undo-redo/undo-redo.service';

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

    readonly SCALING_MAX_VALUE: number = 300;
    readonly SCALING_MIN_VALUE: number = 10;

    readonly ANGLE_MAX_VALUE: number = 360;
    readonly ANGLE_MIN_VALUE: number = 0;
    readonly RADIAN_DEGREE_RATIO: number = 180;
    readonly DEFAULT_SCROLL_ANGLE_CHANGE: number = 15;
    readonly ALT_SCROLL_ANGLE_CHANGE: number = 1;

    private angleIncrement: number = 15;
    wheelScroll: number = 0;
    scaling: number = 100;
    realScaling: number = 1;
    angle: number = this.ANGLE_MIN_VALUE;

    stampsData: HTMLImageElement[];

    constructor(drawingService: DrawingService, private undoRedoService: UndoRedoService) {
        super(drawingService, 'Étampe');
        this.loadImage();
    }

    loadImage(): void {
        this.stampsData = [];
        for (const stamp of this.stamps) {
            const tmpImage: HTMLImageElement = new Image();
            tmpImage.src = stamp;
            this.stampsData.push(tmpImage);
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.displayPreview(event);
    }

    private displayPreview(event: MouseEvent): void {
        this.drawStamp(event, this.drawingService.previewCtx);
    }

    onMouseDown(event: MouseEvent): void {
        this.drawStamp(event, this.drawingService.baseCtx);
    }

    drawStamp(event: MouseEvent, ctx: CanvasRenderingContext2D): void {
        const stampCommand = new StampCommand(this, this.loadUpPropreties(ctx, event));
        stampCommand.execute();
        if (ctx === this.drawingService.baseCtx) {
            this.undoRedoService.addCommand(stampCommand);
        }
    }

    // async drawImageOnCanvas(stampPropreties: StampPropreties): Promise<void> {
    drawImageOnCanvas(stampPropreties: StampPropreties): void {
        // await stampPreview.decode();

        stampPropreties.drawingContext.save();
        stampPropreties.drawingContext.translate(stampPropreties.currentCoords.x, stampPropreties.currentCoords.y);
        stampPropreties.drawingContext.rotate(stampPropreties.angle);
        stampPropreties.drawingContext.translate(-stampPropreties.currentCoords.x, -stampPropreties.currentCoords.y);
        const currentStamp = this.stampsData[stampPropreties.selectedStampIndex];
        stampPropreties.drawingContext.drawImage(
            currentStamp,
            stampPropreties.currentCoords.x - Math.floor((currentStamp.width * stampPropreties.scaling) / 2),
            stampPropreties.currentCoords.y - Math.floor((currentStamp.height * stampPropreties.scaling) / 2),
            currentStamp.width * stampPropreties.scaling,
            currentStamp.height * stampPropreties.scaling,
        );
        stampPropreties.drawingContext.restore();
    }

    loadUpPropreties(ctx: CanvasRenderingContext2D, event: MouseEvent): StampPropreties {
        return {
            drawingContext: ctx,
            currentCoords: this.getPositionFromMouse(event),
            selectedStampIndex: this.stamps.indexOf(this.selectedStampSrc),
            angle: this.angle,
            scaling: this.scaling / 100,
        };
    }

    onScroll(event: WheelEvent): void {
        this.rotateStamp(event);
    }

    rotateStamp(event: WheelEvent): void {
        if (event.deltaY > 0) {
            this.wheelScroll += this.angleIncrement;
        } else {
            this.wheelScroll -= this.angleIncrement;
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.wheelScroll > 360) this.wheelScroll = this.wheelScroll - 360;
        if (this.wheelScroll < 0) this.wheelScroll = 360 - Math.abs(this.wheelScroll);
        this.angle = (this.wheelScroll * Math.PI) / this.RADIAN_DEGREE_RATIO;
        this.drawStamp(event, this.drawingService.previewCtx);
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
