import { Tool } from './tool';

export abstract class DrawingTool extends Tool {
    abstract draw(event: MouseEvent): void;
}
