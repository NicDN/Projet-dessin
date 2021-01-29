import { DrawingService } from '@app/services/drawing/drawing.service';
import { MouseButton, Tool } from './tool';
import { Vec2 } from './vec2';

// enum drawingType {
//     Bordered,
//     FilledNoBordered,
//     FilledAndBordered,
// }
export abstract class Shape extends Tool {
    private beginCoord: Vec2;
    private endCoord: Vec2;

    constructor(drawingService: DrawingService) {
        super(drawingService);
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.beginCoord = this.getPositionFromMouse(event);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.endCoord = this.getPositionFromMouse(event);
            this.draw(this.drawingService.baseCtx, this.beginCoord, this.endCoord);
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.endCoord = this.getPositionFromMouse(event);

            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.draw(this.drawingService.previewCtx, this.beginCoord, this.endCoord);
        }
    }

    abstract draw(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void;
}
