import { Injectable } from '@angular/core';
import { DrawingTool } from '@app/classes/drawing-tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
// import { ColorService } from '@app/services/color/color.service';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

@Injectable({
    providedIn: 'root',
})
export class LineService extends DrawingTool {
    // thicknesss: number;
    private pathData: Vec2[];

    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService);
        this.clearPath();
    }
    draw(event: MouseEvent): void {
        throw new Error('Method not implemented.');
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const delay = 120;
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.previewCtx, this.pathData);
            this.mouseDown = false;
            setTimeout(() => {
                if (this.mouseDown) {
                    const firstPos = this.pathData[0];
                    if (mousePosition.x <= firstPos.x + 20 && mousePosition.x >= firstPos.x - 20) {
                        if (mousePosition.y <= firstPos.y + 20 && mousePosition.y >= firstPos.y - 20) {
                            this.pathData.pop();
                            this.pathData.pop();
                            this.pathData.push(this.pathData[0]);
                        }
                    }
                    this.drawLine(this.drawingService.baseCtx, this.pathData);
                    this.clearPath();
                }
            }, delay);
        }
    }

    onMouseMove(event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        this.pathData.pop();
        this.pathData.push(mousePosition);

        // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawLine(this.drawingService.previewCtx, this.pathData);
    }

    private drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
