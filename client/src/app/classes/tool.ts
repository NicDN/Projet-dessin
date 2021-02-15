import { DrawingService } from '@app/services/drawing/drawing.service';
import { Vec2 } from './vec2';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}
// If the constants are changed, many tests in pencilService and shape will fail, go change the MouseEventCoords there too.
export const HORIZONTAL_OFFSET = 405;
export const VERTICAL_OFFSET = 2;

export abstract class Tool {
    mouseDownCoord: Vec2;
    mouseDown: boolean = false;
    toolName: string;

    constructor(protected drawingService: DrawingService, toolName: string) {
        this.toolName = toolName;
    }

    onMouseDown(event: MouseEvent): void {
        return;
    }

    onMouseUp(event: MouseEvent): void {
        return;
    }

    onMouseMove(event: MouseEvent): void {
        return;
    }

    onMouseOut(event: MouseEvent): void {
        return;
    }

    onMouseEnter(event: MouseEvent): void {
        return;
    }

    onKeyDown(event: KeyboardEvent): void {
        return;
    }

    onKeyUp(event: KeyboardEvent): void {
        return;
    }

    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.pageX - HORIZONTAL_OFFSET, y: event.pageY - VERTICAL_OFFSET };
    }
}
