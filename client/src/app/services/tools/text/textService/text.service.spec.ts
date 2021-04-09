import { TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

describe('TextService', () => {
    // let service: TextService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: MatBottomSheet, useValue: {} }],
        });
        // service = TestBed.inject(TextService);
    });

    // it('should be created', () => {
    //     expect(service).toBeTruthy();
    // });
});
