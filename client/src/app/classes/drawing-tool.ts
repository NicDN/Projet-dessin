import { Tool } from './tool';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}
export abstract class DrawingTool extends Tool {
    abstract draw(event: MouseEvent): void;

}
