import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DrawingForm } from '@common/communication/drawingForm';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SaveService {
    private readonly BASE_URL: string = 'http://localhost:3000/api/database';
    canvasToPost: HTMLCanvasElement;
    private downloadFormat: string;

    constructor(private httpClient: HttpClient) {}

    post(drawingForm: DrawingForm): Observable<void> {
        return this.httpClient.post<void>(this.BASE_URL + '/upload', drawingForm).pipe(catchError(this.handleError<void>('post')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return (error: Error): Observable<T> => {
            return of(result as T);
        };
    }

    async postCanvas(fileName: string, fileFormat: string): Promise<void> {
        // tslint:disable-next-line: prefer-const
        let formData = new FormData();
        // tslint:disable-next-line: no-unused-expression
        fileName ? '' : (fileName = 'Sans titre');
        this.downloadFormat = `image/${fileFormat}`;
        this.canvasToPost.toBlob((blob) => {
            // tslint:disable-next-line: no-non-null-assertion
            formData.append('drawing', blob!, 'youpidou.png');
            formData.append('default', 'test');
            const drawingForm: DrawingForm = {
                id: 0,
                name: fileName,
                tag: [],
                drawing: formData,
            };
            debugger;
            this.post(drawingForm).subscribe();
        }, this.downloadFormat);
    }
}
