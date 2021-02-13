import { DrawingService } from '@app/services/drawing/drawing.service';
import { Vec2 } from './vec2';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}
export abstract class Tool {
    mouseDownCoord: Vec2;
    mouseDown: boolean = false;
    toolName: string;

    constructor(protected drawingService: DrawingService, toolName: string) {
        this.toolName = toolName;
    }

    // tslint:disable-next-line: no-empty
    onMouseDown(event: MouseEvent): void {}
    // tslint:disable-next-line: no-empty
    onMouseUp(event: MouseEvent): void {}
    // tslint:disable-next-line: no-empty
    onMouseMove(event: MouseEvent): void {}
    // tslint:disable-next-line: no-empty
    onMouseOut(event: MouseEvent): void {}
    // tslint:disable-next-line: no-empty
    onMouseEnter(event: MouseEvent): void {}
    // tslint:disable-next-line: no-empty
    onKeyDown(event: KeyboardEvent): void {}
    // tslint:disable-next-line: no-empty
    onKeyUp(event: KeyboardEvent): void {}

    // If the magic numbers are changed, a test in pencilService will fail, go change the MouseEventCoords there too.
    getPositionFromMouse(event: MouseEvent): Vec2 {
        // AQ calculer les valeurs
        return { x: event.pageX - 405, y: event.pageY - 2 };
    }
}
