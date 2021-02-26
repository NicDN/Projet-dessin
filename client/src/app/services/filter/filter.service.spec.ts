import { TestBed } from '@angular/core/testing';

import { FilterService, FilterType } from './filter.service';

describe('FilterService', () => {
    let service: FilterService;
    const canvasStub = document.createElement('canvas');

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FilterService);
        // service.canvas = canvasStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#applyFilter should apply a filter correctly', () => {
        service.applyFilter(FilterType.GrayScale, canvasStub);
        spyOn(service, 'resetWithNotFilter');
        // tslint:disable-next-line: no-string-literal
        expect(service['canvasCtx']).toBe(canvasStub.getContext('2d') as CanvasRenderingContext2D);
    });
});
