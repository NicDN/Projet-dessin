import { Color } from '@app/classes/color';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { Shape } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { EllipseDrawingService } from '@app/services/tools/shape/ellipse/ellipse-drawing.service';
import { PolygonService } from '@app/services/tools/shape/polygon/polygon.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { Observable, Subject } from 'rxjs';

export interface ShapePropreties {
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
    rectangleSubject: Subject<ShapePropreties> = new Subject<ShapePropreties>();
    ellipseSubject: Subject<ShapePropreties> = new Subject<ShapePropreties>();
    polygonSubject: Subject<ShapePropreties> = new Subject<ShapePropreties>();

    constructor(private shape: Shape, private shapePropreties: ShapePropreties) {
        super();
    }

    execute(): void {
        if (this.shape instanceof RectangleDrawingService) this.rectangleSubject.next(this.shapePropreties);
        if (this.shape instanceof EllipseDrawingService) (this.shape as EllipseDrawingService).drawEllipse(this.shapePropreties);
        if (this.shape instanceof PolygonService) (this.shape as PolygonService).drawPolygon(this.shapePropreties);
    }

    newRectangleShapeSignal(): Observable<ShapePropreties> {
        return this.rectangleSubject.asObservable();
    }

    newEllipseShapeSignal(): Observable<ShapePropreties> {
        return this.ellipseSubject.asObservable();
    }

    newPolygonShapeSignal(): Observable<ShapePropreties> {
        return this.polygonSubject.asObservable();
    }
}
