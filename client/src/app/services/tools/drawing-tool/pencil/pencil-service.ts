import { Injectable } from '@angular/core';
import { DrawingTool } from '@app/classes/drawing-tool';
import { MouseButton } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

const DEFAULTTHICKNESS = 1;

@Injectable({
    providedIn: 'root',
})
export class PencilService extends DrawingTool {
    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService, 'Crayon');
        this.clearPath();
        this.thickness = DEFAULTTHICKNESS;
    }

    private pathData: Vec2[];

    draw(event: MouseEvent): void {
        throw new Error('Method not implemented.');
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawLine(this.drawingService.baseCtx, this.pathData);
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.previewCtx, this.pathData);
        }
    }

    protected drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.lineWidth = this.thickness;
        let oldPointX: number = path[0].x;
        let oldPointY: number = path[0].y;
        ctx.globalAlpha = this.colorService.mainColor.opacity;
        ctx.strokeStyle = this.colorService.mainColor.rgbValue;
        ctx.beginPath();

        for (const point of path) {
            ctx.moveTo(oldPointX, oldPointY);
            ctx.lineTo(point.x, point.y);

            oldPointX = point.x;
            oldPointY = point.y;
        }
        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
    }

    onMouseOut(event: MouseEvent): void {
        this.onMouseUp(event);
    }

    onMouseEnter(event: MouseEvent): void {
        // event.buttons is 1 when left click is pressed.
        if (event.buttons === 1) {
            this.mouseDown = true;
        }
    }
}
