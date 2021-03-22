import { Injectable } from '@angular/core';
import { SelectionPropreties } from '@app/classes/commands/selection-command/selection-command';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SelectionService {
    rectangleSubject: Subject<SelectionPropreties> = new Subject<SelectionPropreties>();
    ellipseSubject: Subject<SelectionPropreties> = new Subject<SelectionPropreties>();

    sendSelectionRectangleNotifs(shapePropreties: SelectionPropreties): void {
        this.rectangleSubject.next(shapePropreties);
    }
    sendSelectionEllipseNotifs(shapePropreties: SelectionPropreties): void {
        this.ellipseSubject.next(shapePropreties);
    }

    newRectangleSelection(): Observable<SelectionPropreties> {
        return this.rectangleSubject.asObservable();
    }

    newEllipseSelection(): Observable<SelectionPropreties> {
        return this.ellipseSubject.asObservable();
    }
}
