import { Vec2 } from '@app/classes/vec2';
import { Tool } from './tool';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}
export abstract class DrawingTool extends Tool {
    private pathData: Vec2[];
    abstract draw(event: MouseEvent): void;

    // deplacer l implementation de  onMouseDown, onMouseMove, drawLine ici! (limplementation se trouve presentement dans pencilService)
}
