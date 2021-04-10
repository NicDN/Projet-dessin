import { TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { FillDripService } from './fill-drip.service';

xdescribe('FillDripService', () => {
    let service: FillDripService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: MatBottomSheet, useValue: {} }],
        });
        service = TestBed.inject(FillDripService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
