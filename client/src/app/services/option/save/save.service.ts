import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SaveService {
    private readonly BASE_URL: string = 'http://localhost:3000/api/database';
    canvasToPost: HTMLCanvasElement;
    private downloadFormat: string;

    constructor(private http: HttpClient, private httpClient: HttpClient) {}

    get(): Observable<FormData> {
        return this.http.get<FormData>(this.BASE_URL).pipe(catchError(this.handleError<FormData>('basicGet')));
    }

    post(formData: FormData): Observable<void> {
        return this.httpClient.post<void>(this.BASE_URL + '/upload', formData).pipe(catchError(this.handleError<void>('post')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return (error: Error): Observable<T> => {
            return of(result as T);
        };
    }

    async postCanvas(fileName: string, fileFormat: string): Promise<void> {
        const formData = new FormData();
        // tslint:disable-next-line: no-unused-expression
        fileName ? '' : (fileName = 'Sans titre');
        this.downloadFormat = `image/${fileFormat}`;
        this.canvasToPost.toBlob((blob) => {
            // tslint:disable-next-line: no-non-null-assertion
            formData.append('drawing', blob!);
            formData.append('name', fileName);
            this.post(formData).subscribe();

            // tslint:disable-next-line: prefer-const
            let blob2 = formData.get('drawing');
            let fileName2 = formData.get('name');
            // tslint:disable-next-line: prefer-const
            let exportLink: HTMLAnchorElement = document.createElement('a');

            // tslint:disable-next-line: no-unused-expression
            fileName2 ? '' : (fileName2 = 'Sans titre');
            exportLink.setAttribute('download', `${fileName2}.png`);
            const url = URL.createObjectURL(blob2);
            exportLink.setAttribute('href', url);
            exportLink.click();
        }, this.downloadFormat);
    }
}
