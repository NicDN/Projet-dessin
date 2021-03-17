import { Injectable } from '@angular/core';
import { ShapePropreties } from '@app/classes/commands/shape-command/shape-command';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ShapeService {
    rectangleSubject: Subject<ShapePropreties> = new Subject<ShapePropreties>();
    ellipseSubject: Subject<ShapePropreties> = new Subject<ShapePropreties>();
    polygonSubject: Subject<ShapePropreties> = new Subject<ShapePropreties>();

    sendDrawRectangleNotifs(shapePropreties: ShapePropreties): void {
        this.rectangleSubject.next(shapePropreties);
    }
    sendDrawEllipseNotifs(shapePropreties: ShapePropreties): void {
        this.ellipseSubject.next(shapePropreties);
    }
    sendDrawPolygonNotifs(shapePropreties: ShapePropreties): void {
        this.polygonSubject.next(shapePropreties);
    }

    newRectangleDrawing(): Observable<ShapePropreties> {
        return this.rectangleSubject.asObservable();
    }

    newEllipseDrawing(): Observable<ShapePropreties> {
        return this.ellipseSubject.asObservable();
    }

    newPolygonDrawing(): Observable<ShapePropreties> {
        return this.polygonSubject.asObservable();
    }
}
