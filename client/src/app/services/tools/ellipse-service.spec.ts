import { TestBed } from '@angular/core/testing';
import { RectangleService } from './rectangle-service';

describe('RectangleServiceService', () => {
    let service: RectangleService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RectangleService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
