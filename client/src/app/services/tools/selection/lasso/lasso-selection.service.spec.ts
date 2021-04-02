import { TestBed } from '@angular/core/testing';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';

import { LassoSelectionService } from './lasso-selection.service';

describe('LassoSelectionService', () => {
    let service: LassoSelectionService;
    const snackBarServiceStub = {} as SnackBarService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: SnackBarService, useValue: snackBarServiceStub }],
        });
        service = TestBed.inject(LassoSelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
