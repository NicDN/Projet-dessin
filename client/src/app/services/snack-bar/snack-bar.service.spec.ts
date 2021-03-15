import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SnackBarService } from './snack-bar.service';

describe('SnackBarService', () => {
    let service: SnackBarService;
    let snackbarSpy: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        snackbarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        TestBed.configureTestingModule({
            providers: [{ provide: MatSnackBar, useValue: snackbarSpy }],
        });
        service = TestBed.inject(SnackBarService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#openSnackBar should open the snack bar correctly', () => {
        const MESSAGE = 'open';
        const ACTION = 'close';
        service.openSnackBar(MESSAGE, ACTION);
        expect(snackbarSpy.open).toHaveBeenCalled();
    });
});
