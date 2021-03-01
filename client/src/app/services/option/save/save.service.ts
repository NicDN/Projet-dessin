import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SaveDialogComponent } from '@app/components/dialogs/save-dialog/save-dialog.component';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SaveService {
    private readonly BASE_URL: string = 'http://localhost:3000/api/index';

    constructor(private dialog: MatDialog, private http: HttpClient) {}

    openDialog(): void {
        this.dialog.open(SaveDialogComponent);
    }

    basicGet(): Observable<FormData> {
        return this.http.get<FormData>(this.BASE_URL).pipe(catchError(this.handleError<FormData>('basicGet')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return (error: Error): Observable<T> => {
            return of(result as T);
        };
    }
}
