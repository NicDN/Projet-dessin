import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DrawingForm } from '@common/communication/drawingForm';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SaveService {
    private readonly BASE_URL: string = 'http://localhost:3000/api/database';
    canvasToPost: HTMLCanvasElement;

    constructor(private httpClient: HttpClient, private drawingService: DrawingService) {}

    post(drawingForm: DrawingForm): Observable<void> {
        return this.httpClient.post<void>(this.BASE_URL + '/upload', drawingForm).pipe(catchError(this.handleError<void>('post')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return (error: Error): Observable<T> => {
            return of(result as T);
        };
    }

    async postCanvas(fileName: string, tags: string[]): Promise<void> {
        // tslint:disable-next-line: no-unused-expression
        const drawingForm: DrawingForm = {
            id: '3',
            name: fileName,
            tags,
            drawingData: this.drawingService.canvas.toDataURL(),
        };
        this.post(drawingForm).subscribe();
    }
}
