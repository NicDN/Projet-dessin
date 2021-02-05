import { TestBed } from '@angular/core/testing';

import { CanvasCommunicationService } from './canvas-communication.service';

describe('CanvasCommunicationService', () => {
    let service: CanvasCommunicationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CanvasCommunicationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
