import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DrawingForm } from '@common/communication/drawing-form';
import * as Httpstatus from 'http-status-codes';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SaveService {
    private readonly NO_SERVER_RESPONSE: number = 0;
    private readonly BASE_URL: string = 'http://localhost:3000/api/database';
    canvasToPost: HTMLCanvasElement;

    constructor(private httpClient: HttpClient, private drawingService: DrawingService) {}

    postDrawing(fileName: string, tags: string[]): Observable<void> {
        const drawingForm: DrawingForm = {
            id: '4',
            name: fileName,
            tags,
            drawingData: this.drawingService.canvas.toDataURL(),
        };
        return this.httpClient.post<void>(this.BASE_URL + '/upload', drawingForm).pipe(catchError(this.handleError<void>('post')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return (error: Error): Observable<T> => {
            if (
                (error as HttpErrorResponse).status === this.NO_SERVER_RESPONSE ||
                (error as HttpErrorResponse).status === Httpstatus.StatusCodes.INTERNAL_SERVER_ERROR
            ) {
                return throwError('');
            }
            return of(result as T);
        };
    }
}
