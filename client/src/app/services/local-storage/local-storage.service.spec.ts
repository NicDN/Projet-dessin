import { TestBed } from '@angular/core/testing';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';

import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
    let service: LocalStorageService;
    let snackbarServiceSpy: jasmine.SpyObj<SnackBarService>;

    beforeEach(() => {
        snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

        TestBed.configureTestingModule({
            providers: [{ provide: SnackBarService, useValue: snackbarServiceSpy }],
        });
        service = TestBed.inject(LocalStorageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
