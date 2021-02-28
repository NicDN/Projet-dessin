import { TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ExportService } from '@app/services/option/export/export.service';

import { FilterService, FilterType } from './filter.service';

// tslint:disable: no-string-literal
describe('FilterService', () => {
    let service: FilterService;
    const canvasMock = document.createElement('canvas') as HTMLCanvasElement;
    const canvasCtxMock = canvasMock.getContext('2d') as CanvasRenderingContext2D;

    let exportServiceSpy: jasmine.SpyObj<ExportService>;

    const drawingServiceMock = {
        canvas: canvasMock,
    } as DrawingService;

    beforeEach(() => {
        exportServiceSpy = jasmine.createSpyObj('ExportService', ['{}']);
        TestBed.configureTestingModule({
            providers: [
                { provide: ExportService, useValue: exportServiceSpy },
                { provide: DrawingService, useValue: drawingServiceMock },
            ],
        });
        service = TestBed.inject(FilterService);

        service.canvas = canvasMock;
        service['canvasCtx'] = canvasCtxMock;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#applyFilter should apply a filter correctly', () => {
        const canvasToFilter = drawingServiceMock.canvas;
        const FILTER_TYPE = FilterType.GrayScale;

        // tslint:disable-next-line: no-any
        spyOn<any>(service, 'resetWithNotFilter');
        spyOn(service['canvasCtx'], 'drawImage');
        service.applyFilter(FILTER_TYPE, canvasToFilter);

        expect(service['resetWithNotFilter']).toHaveBeenCalled();
        expect(service['canvasCtx'].filter).toBe(service.filters[FILTER_TYPE].property);
        expect(service['canvasCtx'].drawImage).toHaveBeenCalled();
        expect(exportServiceSpy.canvasToExport).toBe(canvasToFilter);
    });

    it('#resetWithNotFilter should remove a filter fromc canvas', () => {
        const RESET_FILTER = 'blur(0px) contrast(1) sepia(0) saturate(1) brightness(1) invert(0)';
        spyOn(service['canvasCtx'], 'drawImage');
        service['resetWithNotFilter']();
        expect(service['canvasCtx'].filter).toBe(RESET_FILTER);
        expect(service['canvasCtx'].drawImage).toHaveBeenCalled();
    });
});
