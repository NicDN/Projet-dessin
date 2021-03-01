import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DrawingForm } from '@common/communication/drawingForm';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class CarouselService {
    private readonly BASE_URL: string = 'http://localhost:3000/api/index';

    constructor(private http: HttpClient) {}

    requestDrawingsFromServer(): Observable<DrawingForm[]> {
        return this.http.get<DrawingForm[]>(this.BASE_URL).pipe(catchError(this.handleError<DrawingForm[]>('requestDrawingsFromServer')));
    }

    // How to make a drawing have a id ?
    deleteDrawingFromServer(id: number): Observable<{}> {
        const url = `${this.BASE_URL}/delete/${id}`;
        return this.http.delete<DrawingForm>(url).pipe(catchError(this.handleError<DrawingForm>('deleteDrawingFromServer')));

        // TODO: DELETE request should be followed by a GET request, in client or server ?
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return (error: Error): Observable<T> => {
            return of(result as T);
        };
    }
}
