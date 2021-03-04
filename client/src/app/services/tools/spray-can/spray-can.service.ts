import { Injectable } from '@angular/core';
import { MouseButton } from '@app/classes/tool';
import { TraceTool } from '@app/classes/trace-tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class SprayCanService extends TraceTool {
    readonly ONESECMS: number = 1000;
    private emissionRate: number;
    private sprayDiameter: number;
    private dropletsDiameter: number;
    private timer: number;
    private cleanPathData: Vec2[];
    private pathData: Vec2[];

    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService, 'Aérosol');
        this.mouseDownCoord = { x: 0, y: 0 };
        this.clearPath();
        this.dropletsDiameter = 10;
        this.sprayDiameter = 70;
        this.emissionRate = 50;
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

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
        }
        this.mouseDown = false;
        this.clearPath();
        clearInterval(this.timer);
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
        }
    }

    onMouseOut(event: MouseEvent): void {
        this.onMouseUp(event);
    }

    onMouseEnter(event: MouseEvent): void {
        // event.buttons is 1 when left click is pressed.
        if (event.buttons === 1) {
            this.mouseDown = true;
            this.onMouseDown(event);
        }
    }

    drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        const self = this;
        // tslint:disable-next-line: only-arrow-functions
        this.timer = setInterval(function (): void {
            self.drawSpray(ctx, path);
        }, this.ONESECMS / this.emissionRate);
    }

    getRandomNumber(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    setContext(ctx: CanvasRenderingContext2D): void {
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.fillStyle = this.colorService.mainColor.rgbValue;
    }

    drawSpray(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.save();
        this.setContext(ctx);
        for (let i = 40; i--; ) {
            const angle = this.getRandomNumber(0, Math.PI * 2);
            const radius = this.getRandomNumber(0, this.sprayDiameter);
            ctx.globalAlpha = Math.random();
            ctx.beginPath();
            ctx.arc(
                path[path.length - 1].x + radius * Math.cos(angle),
                path[path.length - 1].y + radius * Math.sin(angle),
                this.getRandomNumber(1, this.dropletsDiameter),
                0,
                2 * Math.PI,
            );
            ctx.fill();
        }
        ctx.restore();
        this.cleanPathData.push(path[path.length - 1]); // This is for Tony The OG and his undo redo
    }
}
