import { TestBed } from '@angular/core/testing';

import { RectangleDrawingService } from './rectangle-drawing.service';

describe('RectangleDrawingService', () => {
    let service: RectangleDrawingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RectangleDrawingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
