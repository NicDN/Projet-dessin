import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { DrawingForm } from '@common/communication/drawing-form';

import { CarouselService } from './carousel.service';

fdescribe('CarouselService', () => {
    let service: CarouselService;
    let httpMock: HttpTestingController;
    let baseUrl: string;

    const TAGS_MOCK: string[] = ['one', 'two', 'three', 'four', 'five', 'six'];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: MatDialog, useValue: {} }],
        });
        service = TestBed.inject(CarouselService);
        httpMock = TestBed.inject(HttpTestingController);
        // tslint:disable-next-line: no-string-literal
        baseUrl = service['BASE_URL'];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('#requestDrawingsFromServer should return expected drawings (HttpClient called once)', () => {
        const expectedDrawings: DrawingForm[] = [
            { id: '1', name: 'drawingOne', tags: TAGS_MOCK, drawingData: 'base64' },
            { id: '2', name: 'drawingTwo', tags: TAGS_MOCK, drawingData: 'base64' },
            { id: '3', name: 'drawingThree', tags: TAGS_MOCK, drawingData: 'base64' },
        ];

        service.requestDrawingsFromServer(TAGS_MOCK, 1).subscribe((response: DrawingForm[]) => {
            expect(response[0]).toEqual(expectedDrawings[0]);
            expect(response[1]).toEqual(expectedDrawings[1]);
            expect(response[2]).toEqual(expectedDrawings[2]);
        }, fail);

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('GET');
        req.flush(expectedDrawings);
    });

    it('#deleteDrawingFromServer should not return any drawing (HttpClient called once)', () => {
        const id = 'test id';
        // tslint:disable-next-line: no-empty
        service.deleteDrawingFromServer(id).subscribe(() => {}, fail);

        const req = httpMock.expectOne(baseUrl + '/delete/' + id);
        expect(req.request.method).toBe('DELETE');
    });

    it('#handleError should handle http error safely', () => {
        expect(service).toBeTruthy();
    });
});
