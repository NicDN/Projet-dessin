import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DrawingForm } from '@common/communication/drawing-form';
import * as Httpstatus from 'http-status-codes';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class CarouselService {
    private readonly NO_SERVER_RESPONSE: number = 0;
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
            if ((error as HttpErrorResponse).status === this.NO_SERVER_RESPONSE) {
                return throwError("Impossible d'accéder au serveur.");
            }
            if ((error as HttpErrorResponse).status === Httpstatus.StatusCodes.INTERNAL_SERVER_ERROR) {
                return throwError('Impossible de supprimer le dessin sur le serveur.');
            }
            if ((error as HttpErrorResponse).status === Httpstatus.StatusCodes.NOT_FOUND) {
                return throwError('Impossible de supprimer les informations du dessin sur la base de données.');
            }
            if ((error as HttpErrorResponse).status === Httpstatus.StatusCodes.BAD_GATEWAY) {
                return throwError('La suppression sur la base de donnée a échouée.');
            }
            return of(result as T);
        };
    }
}
