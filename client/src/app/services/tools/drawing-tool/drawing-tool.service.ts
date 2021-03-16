import { Injectable } from '@angular/core';
import { DrawingToolPropreties } from '@app/classes/commands/drawing-tool-command/drawing-tool-command';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DrawingToolService {
    constructor() {}

    pencilSubject: Subject<DrawingToolPropreties> = new Subject<DrawingToolPropreties>();
    eraserSubject: Subject<DrawingToolPropreties> = new Subject<DrawingToolPropreties>();
    lineSubject: Subject<DrawingToolPropreties> = new Subject<DrawingToolPropreties>();

    sendDrawingPencilNotifs(drawingToolPropreties: DrawingToolPropreties): void {
        this.pencilSubject.next(drawingToolPropreties);
    }

    sendDrawingEraserNotifs(drawingToolPropreties: DrawingToolPropreties): void {
        this.eraserSubject.next(drawingToolPropreties);
    }

    sendDrawingLineNotifs(drawingToolPropreties: DrawingToolPropreties): void {
        this.lineSubject.next(drawingToolPropreties);
    }

    listenToNewDrawingPencilNotifications(): Observable<DrawingToolPropreties> {
        return this.pencilSubject.asObservable();
    }

    listenToNewDrawingEraserNotifications(): Observable<DrawingToolPropreties> {
        return this.eraserSubject.asObservable();
    }

    listenToNewDrawingLineNotifications(): Observable<DrawingToolPropreties> {
        return this.lineSubject.asObservable();
    }
}
