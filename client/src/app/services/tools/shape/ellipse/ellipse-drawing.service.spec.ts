import { TestBed } from '@angular/core/testing';

import { EllipseDrawingService } from './ellipse-drawing.service';

describe('EllipseDrawingService', () => {
    let service: EllipseDrawingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(EllipseDrawingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
