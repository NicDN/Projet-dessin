import { Tool } from './tool';
export abstract class Shape extends Tool {
    abstract draw(event: MouseEvent): void;
}