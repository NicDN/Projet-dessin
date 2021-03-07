import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
        });
        service = TestBed.inject(DialogService);
    });

    beforeEach(() => {
        dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#openDialog should open the right dialog ', () => {
        // // Opening carrousel dialog
        service.openDialog(DialogType.Carousel);
        expect(dialogSpy).toHaveBeenCalledWith(CarouselDialogComponent);
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
});
