import { TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';

import { LocalStorageService } from './local-storage.service';

// tslint:disable: no-string-literal
describe('LocalStorageService', () => {
    let service: LocalStorageService;
    let snackbarServiceSpy: jasmine.SpyObj<SnackBarService>;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;

    const canvasMock = document.createElement('canvas');

    beforeEach(() => {
        snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['confirmReload'], {
            canvas: canvasMock,
        });

        TestBed.configureTestingModule({
            providers: [
                { provide: SnackBarService, useValue: snackbarServiceSpy },
                { provide: DrawingService, useValue: drawingServiceSpyObj },
            ],
        });
        service = TestBed.inject(LocalStorageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#saveCanvas should save the url of the canvas to the localstorage', () => {
        service.saveCanvas();
        expect(localStorage.getItem('canvas')).toEqual(service['drawingService'].canvas.toDataURL());
    });

    it('should display snack bar error if saving from localstorage throws a error', () => {
        spyOn(localStorage, 'setItem').and.throwError('fake error');
        service.saveCanvas();
        expect(service['snackBarService'].openSnackBar).toHaveBeenCalledWith('Erreur lors de la sauvegarde automatique.', 'Fermer');
    });

    it('#storageIsEmpty should return true if the storage is empty', () => {
        spyOn(localStorage, 'getItem').and.returnValue(null);
        expect(service.storageIsEmpty()).toBeTrue();
    });

    it('#storageIsEmpty should return false if the storage is not empty', () => {
        spyOn(localStorage, 'getItem').and.returnValue('not empty!');
        expect(service.storageIsEmpty()).toBeFalse();
    });

    it('#confirmNewDrawing should return true if the storage is empty', async () => {
        spyOn(service, 'storageIsEmpty').and.returnValue(true);
        expect(await service.confirmNewDrawing()).toBeTrue();
    });

    it('#confirmNewDrawing should return #drawingService return value', async () => {
        drawingServiceSpyObj.confirmReload.and.resolveTo(true);
        spyOn(service, 'storageIsEmpty').and.returnValue(false);

        expect(await service.confirmNewDrawing()).toBeTrue();
    });
});
