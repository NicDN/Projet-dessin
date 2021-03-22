import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CarouselDialogComponent } from '@app/components/dialogs/carousel-dialog/carousel-dialog.component';
import { ExportDialogComponent } from '@app/components/dialogs/export-dialog/export-dialog.component';
import { SaveDialogComponent } from '@app/components/dialogs/save-dialog/save-dialog.component';
import { Subject } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';

import { DialogService, DialogType } from './dialog.service';

describe('DialogService', () => {
    let service: DialogService;

    let dialogSpy: jasmine.Spy;

    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['']);

        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpyObj },
                { provide: Router, useValue: routerSpy },
            ],
        });
        service = TestBed.inject(DialogService);
    });

    beforeEach(() => {
        // @ts-ignore
        routerSpy.url = '/editor';
        dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#openDialog should open the right dialog ', () => {
        // // Opening carrousel dialog
        service.openDialog(DialogType.Carousel);
        expect(dialogSpy).toHaveBeenCalledWith(CarouselDialogComponent, {
            width: '1400px',
            maxWidth: '100vw',
        });
        expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled();

        // // Opening save dialog
        service.openDialog(DialogType.Save);
        expect(dialogSpy).toHaveBeenCalledWith(SaveDialogComponent);
        expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled();

        // // Opening export dialog
        service.openDialog(DialogType.Export);
        expect(dialogSpy).toHaveBeenCalledWith(ExportDialogComponent);
        expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled();
    });

    it('#listenToKeyEvents should return a observable subject', () => {
        const expectedSubject: Subject<boolean> = new Subject<boolean>();
        // tslint:disable-next-line: no-string-literal
        service['subject'] = expectedSubject;
        expect(service.listenToKeyEvents()).toEqual(expectedSubject.asObservable());
    });

    it('#openDialog should not open save dialog if the current route is  /home ', () => {
        // @ts-ignore
        routerSpy.url = '/home';
        service.openDialog(DialogType.Save);
        expect(dialogSpy).not.toHaveBeenCalled();
    });

    it('#openDialog should not open export dialog if the current route is  /home ', () => {
        // @ts-ignore
        routerSpy.url = '/home';
        service.openDialog(DialogType.Export);
        expect(dialogSpy).not.toHaveBeenCalled();
    });
});
