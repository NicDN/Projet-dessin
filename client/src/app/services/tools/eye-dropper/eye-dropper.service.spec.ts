import { TestBed } from '@angular/core/testing';

import { EyeDropperService } from './eye-dropper.service';

describe('EyeDropperService', () => {
    let service: EyeDropperService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(EyeDropperService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
