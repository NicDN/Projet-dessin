import { Color } from '@app/classes/color';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { Shape } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';

export enum ShapeType {
    Rectangle = 1,
    Ellipse = 2,
    Polygon = 3,
}

export interface ShapePropreties {
    shapeType: ShapeType;
    drawingContext: CanvasRenderingContext2D;
    beginCoords: Vec2;
    endCoords: Vec2;
    drawingThickness: number;
    mainColor: Color;
    secondaryColor: Color;
    isAlternateShape: boolean;
    traceType: number;
    numberOfSides?: number;
}

export class ShapeCommand extends AbstractCommand {
    constructor(private shapePropreties: ShapePropreties, private shape: Shape) {
        super();
    }

    execute(): void {
        this.shape.drawShape(this.shapePropreties);
    }
}
