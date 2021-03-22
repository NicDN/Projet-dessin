import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { RandomStoring, SprayCanCommand, SprayCanPropreties } from '@app/classes/commands/spray-can-command/spray-can-command';
import { MouseButton } from '@app/classes/tool';
import { TraceTool } from '@app/classes/trace-tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class SprayCanService extends TraceTool {
    readonly MIN_DROPLETS_DIAMETER: number = 3;
    readonly MIN_SPRAY_DIAMETER: number = 15;
    readonly MIN_EMISSION_RATE: number = 25;

    readonly MAX_DROPLETS_DIAMETER: number = 15;
    readonly MAX_SPRAY_DIAMETER: number = 70;
    readonly MAX_EMISSION_RATE: number = 70;

    private readonly ONE_SEC_MS: number = 1000;
    private readonly CIRCLE_NUMBER: number = 40;

    private timer: ReturnType<typeof setInterval>;
    private cleanPathData: Vec2[] = [];
    private pathData: Vec2[] = [];
    private randomStoring: RandomStoring = { angleArray: [], radiusArray: [] };

    emissionRate: number = this.MIN_EMISSION_RATE;
    sprayDiameter: number = this.MIN_SPRAY_DIAMETER;
    dropletsDiameter: number = this.MIN_DROPLETS_DIAMETER;

    constructor(drawingService: DrawingService, colorService: ColorService, private undoRedoService: UndoRedoService) {
        super(drawingService, colorService, 'Aérosol');
        this.mouseDownCoord = { x: 0, y: 0 };
        this.clearPath();
    }

    private clearPath(): void {
        this.pathData = [];
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.drawLine(this.drawingService.baseCtx, this.pathData);
        }
    }

    onMouseUp(): void {
        if (this.mouseDown) {
            this.mouseDown = false;
            this.clearPath();
            clearInterval(this.timer);
            const sprayCanCommand: SprayCanCommand = new SprayCanCommand(this, this.loadProprities(this.drawingService.baseCtx, this.cleanPathData));
            sprayCanCommand.setRandomStoring(this.randomStoring);
            this.cleanPathData = [];
            this.randomStoring = { angleArray: [], radiusArray: [] };
            this.undoRedoService.addCommand(sprayCanCommand);
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
        }
    }

    onMouseEnter(event: MouseEvent): void {
        // event.buttons is 1 when left click is pressed.
        clearInterval(this.timer);
        if (event.buttons === 1) {
            this.mouseDown = true;
            this.onMouseDown(event);
        }
    }

    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        const self = this;
        this.timer = setInterval(() => self.drawSpray(ctx, path), this.ONE_SEC_MS / this.emissionRate);
    }

    private getRandomNumber(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    private setContext(ctx: CanvasRenderingContext2D, color: Color): void {
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.fillStyle = color.rgbValue;
    }

    private drawSpray(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        const sprayCanCommand = new SprayCanCommand(this, this.loadProprities(ctx, path));
        sprayCanCommand.executeNotUndoRedo();
    }

    private loadProprities(ctx: CanvasRenderingContext2D, path: Vec2[]): SprayCanPropreties {
        this.storeRandom();
        return {
            drawingCtx: ctx,
            drawingPath: path,
            mainColor: { rgbValue: this.colorService.mainColor.rgbValue, opacity: this.colorService.mainColor.opacity },
            dropletsDiameter: this.dropletsDiameter / 2,
            sprayDiameter: this.sprayDiameter,
            emissionRate: this.emissionRate,
            angleArray: this.randomStoring.angleArray[this.randomStoring.angleArray.length - 1],
            radiusArray: this.randomStoring.radiusArray[this.randomStoring.radiusArray.length - 1],
        };
    }

    private storeRandom(): void {
        this.randomStoring.angleArray.push(this.generateRandomArray(0, Math.PI * 2));
        this.randomStoring.radiusArray.push(this.generateRandomArray(0, this.sprayDiameter / 2));
    }

    sprayOnCanvas(sprayCanPropreties: SprayCanPropreties, pointToDraw: Vec2, isUsingUndoRedo: boolean): void {
        sprayCanPropreties.drawingCtx.save();
        this.setContext(sprayCanPropreties.drawingCtx, sprayCanPropreties.mainColor);

        for (let i = this.CIRCLE_NUMBER; i !== 0; i--) {
            sprayCanPropreties.drawingCtx.globalAlpha = sprayCanPropreties.mainColor.opacity;
            sprayCanPropreties.drawingCtx.beginPath();
            sprayCanPropreties.drawingCtx.arc(
                pointToDraw.x + sprayCanPropreties.radiusArray[i] * Math.cos(sprayCanPropreties.angleArray[i]),
                pointToDraw.y + sprayCanPropreties.radiusArray[i] * Math.sin(sprayCanPropreties.angleArray[i]),
                sprayCanPropreties.dropletsDiameter,
                0,
                2 * Math.PI,
            );
            sprayCanPropreties.drawingCtx.fill();
        }

        sprayCanPropreties.drawingCtx.restore();

        if (!isUsingUndoRedo) {
            this.cleanPathData.push(pointToDraw);
        }
    }

    private generateRandomArray(min: number, max: number): number[] {
        const tmpArray: number[] = [];
        for (let i = 0; i < this.CIRCLE_NUMBER; i++) {
            tmpArray.push(this.getRandomNumber(min, max));
        }
        return tmpArray;
    }

    drawTrace(): void {
        // Nothing yet
    }
}
