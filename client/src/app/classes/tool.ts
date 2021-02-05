import { ColorService } from '@app/services/color/color.service';
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
    thickness: number = 1; // thickness ne devrait pas aller necessairement ici parce que des tools ne pourraient ne pas sen servir

    constructor(protected drawingService: DrawingService, protected colorService: ColorService, toolName: string) {
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

    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.offsetX, y: event.offsetY };
    }
}
