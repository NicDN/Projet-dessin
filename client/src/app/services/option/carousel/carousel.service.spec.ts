import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';

import { CarouselService } from './carousel.service';

describe('CarouselService', () => {
    let service: CarouselService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: MatDialog, useValue: {} }],
        });
        service = TestBed.inject(CarouselService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
