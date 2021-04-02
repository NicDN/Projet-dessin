import { Injectable } from '@angular/core';
import { StampCommand, StampPropreties } from '@app/classes/commands/stamp-command/stamp-command';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class StampService extends Tool {
    // TODO: looks not acceptable for AQ
    stamps: string[] = [
        ' ../../../../../assets/stamps/kali.jpeg',
        ' ../../../../../assets/stamps/github.png',
        ' ../../../../../assets/stamps/mario.jpeg',
        ' ../../../../../assets/stamps/emoji.png',
        ' ../../../../../assets/stamps/minecraft.png',
        ' ../../../../../assets/stamps/creeper.png',
    ];

    readonly SCALING_MAX_VALUE: number = 300;
    readonly SCALING_MIN_VALUE: number = 10;
    readonly ANGLE_MIN_VALUE: number = 0;

    private readonly ANGLE_MAX_VALUE: number = 360;
    private readonly RADIAN_DEGREE_RATIO: number = 180;
    private readonly DEFAULT_SCROLL_ANGLE_CHANGE: number = 15;
    private readonly ALT_SCROLL_ANGLE_CHANGE: number = 1;

    private angleIncrement: number = 15;
    private wheelScroll: number = 0;
    private stampsData: HTMLImageElement[] = [];
    scaling: number = 100;
    angle: number = this.ANGLE_MIN_VALUE;
    selectedStampSrc: string = this.stamps[0];

    constructor(drawingService: DrawingService, private undoRedoService: UndoRedoService) {
        super(drawingService, 'Étampe');
        this.loadStamps();
    }

    private loadStamps(): void {
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

    private drawStamp(event: MouseEvent, ctx: CanvasRenderingContext2D): void {
        const stampCommand = new StampCommand(this, this.loadUpPropreties(ctx, event));
        stampCommand.execute();
        if (ctx === this.drawingService.baseCtx) {
            this.undoRedoService.addCommand(stampCommand);
        }
    }

    drawImageOnCanvas(stampPropreties: StampPropreties): void {
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

    private loadUpPropreties(ctx: CanvasRenderingContext2D, event: MouseEvent): StampPropreties {
        const SCALING_DENOMINATOR = 100;
        return {
            drawingContext: ctx,
            currentCoords: this.getPositionFromMouse(event),
            selectedStampIndex: this.stamps.indexOf(this.selectedStampSrc),
            angle: this.angle,
            scaling: this.scaling / SCALING_DENOMINATOR,
        };
    }

    onScroll(event: WheelEvent): void {
        this.rotateStamp(event);
    }

    private rotateStamp(event: WheelEvent): void {
        event.deltaY > 0 ? (this.wheelScroll += this.angleIncrement) : (this.wheelScroll -= this.angleIncrement);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        if (this.wheelScroll > this.ANGLE_MAX_VALUE) this.wheelScroll = this.wheelScroll - this.ANGLE_MAX_VALUE;
        if (this.wheelScroll < 0) this.wheelScroll = this.ANGLE_MAX_VALUE - Math.abs(this.wheelScroll);

        this.angle = (this.wheelScroll * Math.PI) / this.RADIAN_DEGREE_RATIO;
        this.drawStamp(event, this.drawingService.previewCtx);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.altKey) {
            this.angleIncrement = this.ALT_SCROLL_ANGLE_CHANGE;
        }
    }

    onKeyUp(): void {
        this.angleIncrement = this.DEFAULT_SCROLL_ANGLE_CHANGE;
    }
}
