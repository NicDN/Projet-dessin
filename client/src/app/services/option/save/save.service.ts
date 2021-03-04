import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DrawingForm } from '@common/communication/drawingForm';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SaveService {
    private readonly GENERIC_ERROR_STATUS_CODE: number = 0;
    private readonly BASE_URL: string = 'http://localhost:3000/api/database';
    canvasToPost: HTMLCanvasElement;

    constructor(private httpClient: HttpClient, private drawingService: DrawingService) {}

    postDrawing(fileName: string, tags: string[]): Observable<void> {
        const drawingForm: DrawingForm = {
            id: '-1',
            name: fileName,
            tags,
            drawingData: this.drawingService.canvas.toDataURL(),
        };
        return this.httpClient.post<void>(this.BASE_URL + '/upload', drawingForm).pipe(catchError(this.handleError<void>('post')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return (error: Error): Observable<T> => {
            if ((error as HttpErrorResponse).status === this.GENERIC_ERROR_STATUS_CODE) {
                return throwError('');
            }
            return of(result as T);
        };
    }
}
