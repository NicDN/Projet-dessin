import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DrawingForm } from '@common/communication/drawing-form';
import { environment } from '@env/environment';
import * as Httpstatus from 'http-status-codes';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class CarouselService {
    private readonly NO_SERVER_RESPONSE: number = 0;

    constructor(private http: HttpClient) {}

    requestDrawingsFromServer(searchedTags: string[], index: number): Observable<DrawingForm[]> {
        let params = new HttpParams();
        params = params.append('tags', JSON.stringify(searchedTags));
        params = params.append('index', '' + index);
        return this.http
            .get<DrawingForm[]>(environment.serverBaseUrl, { params })
            .pipe(catchError(this.handleError<DrawingForm[]>('requestDrawingsFromServer')));
    }

    deleteDrawingFromServer(id: string): Observable<{}> {
        const url = `${environment.serverBaseUrl}/${id}`;
        return this.http.delete<DrawingForm>(url).pipe(catchError(this.handleError<DrawingForm>('deleteDrawingFromServer')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return (error: Error): Observable<T> => {
            if ((error as HttpErrorResponse).status === this.NO_SERVER_RESPONSE) {
                return throwError("Impossible d'accéder au serveur.");
            }
            if ((error as HttpErrorResponse).status === Httpstatus.StatusCodes.INTERNAL_SERVER_ERROR) {
                return throwError('Le dessin est inexistant sur le serveur.');
            }
            if ((error as HttpErrorResponse).status === Httpstatus.StatusCodes.NOT_FOUND) {
                return throwError('Les informations du dessin sont inexistantes sur la base de données');
            }
            if ((error as HttpErrorResponse).status === Httpstatus.StatusCodes.BAD_GATEWAY) {
                return throwError("Erreur lors de l'accès à la base de données.");
            }
            return throwError("Une erreur s'est produite");
        };
    }
}
