import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DrawingForm } from '@common/communication/drawing-form';
import * as Httpstatus from 'http-status-codes';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SaveService {
    private readonly NO_SERVER_RESPONSE: number = 0;
    private readonly BASE_URL: string = 'http://localhost:3000/api/server';

    constructor(private httpClient: HttpClient, private drawingService: DrawingService) {}

    postDrawing(fileName: string, tags: string[]): Observable<void> {
        const drawingForm: DrawingForm = {
            id: '-1',
            name: fileName,
            tags,
            drawingData: this.drawingService.canvas.toDataURL(),
        };
        return this.httpClient.post<void>(this.BASE_URL, drawingForm).pipe(catchError(this.handleError<void>('postDrawing')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return (error: Error): Observable<T> => {
            if ((error as HttpErrorResponse).status === this.NO_SERVER_RESPONSE) {
                return throwError("Impossible d'accéder au serveur.");
            }
            if ((error as HttpErrorResponse).status === Httpstatus.StatusCodes.INTERNAL_SERVER_ERROR) {
                return throwError('La sauvegarde du dessin sur le serveur a échouée.');
            }
            if ((error as HttpErrorResponse).status === Httpstatus.StatusCodes.BAD_GATEWAY) {
                return throwError('La sauvegarde des informations sur la base de données a échouée');
            }
            return throwError("Une erreur s'est produite");
        };
    }
}
