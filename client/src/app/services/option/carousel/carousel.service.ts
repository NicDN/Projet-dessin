import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DrawingForm } from '@common/communication/drawingForm';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class CarouselService {
    private readonly BASE_URL: string = 'http://localhost:3000/api/database';

    constructor(private http: HttpClient) {}

    requestDrawingsFromServer(searchedTags: string[], index: number): Observable<DrawingForm[]> {
        let params = new HttpParams();
        params = params.append('tags', JSON.stringify(searchedTags));
        params = params.append('index', '' + index);
        return this.http
            .get<DrawingForm[]>(this.BASE_URL, { params })
            .pipe(catchError(this.handleError<DrawingForm[]>('requestDrawingsFromServer')));
    }

    deleteDrawingFromServer(id: string): Observable<{}> {
        const url = `${this.BASE_URL}/delete/${id}`;
        return this.http.delete<DrawingForm>(url).pipe(catchError(this.handleError<DrawingForm>('deleteDrawingFromServer')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return (error: Error): Observable<T> => {
            return of(result as T);
        };
    }
}
