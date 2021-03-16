import { Color } from '@app/classes/color';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { Vec2 } from '@app/classes/vec2';
import { ShapeService } from '@app/services/tools/shape/shape.service';

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
    constructor(private shapePropreties: ShapePropreties, private shapeService: ShapeService) {
        super();
    }

    execute(): void {
        if (this.shapePropreties.shapeType === ShapeType.Rectangle) this.shapeService.sendDrawRectangleNotifs(this.shapePropreties);
        if (this.shapePropreties.shapeType === ShapeType.Ellipse) this.shapeService.sendDrawEllipseNotifs(this.shapePropreties);
        if (this.shapePropreties.shapeType === ShapeType.Polygon) this.shapeService.sendDrawPolygonNotifs(this.shapePropreties);
    }
}
