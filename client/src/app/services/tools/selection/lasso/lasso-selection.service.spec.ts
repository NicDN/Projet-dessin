import { TestBed } from '@angular/core/testing';

import { LassoSelectionService } from './lasso-selection.service';

describe('LassoSelectionService', () => {
    let service: LassoSelectionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LassoSelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
