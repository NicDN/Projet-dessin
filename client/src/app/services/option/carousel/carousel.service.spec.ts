import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { DrawingForm } from '@common/communication/drawing-form';
import * as Httpstatus from 'http-status-codes';

import { CarouselService } from './carousel.service';

// tslint:disable: no-string-literal
describe('CarouselService', () => {
    let service: CarouselService;
    let httpMock: HttpTestingController;
    let baseUrl: string;

    const ID = 'test id';
    const TAGS_MOCK: string[] = ['one', 'two', 'three', 'four', 'five', 'six'];
    const index = 1;

    const expectedDrawings: DrawingForm[] = [
        { id: '1', name: 'drawingOne', tags: TAGS_MOCK, drawingData: 'base64' },
        { id: '2', name: 'drawingTwo', tags: TAGS_MOCK, drawingData: 'base64' },
        { id: '3', name: 'drawingThree', tags: TAGS_MOCK, drawingData: 'base64' },
    ];

    const NO_SERVER_RESPONSE = 0;

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
        service.requestDrawingsFromServer(TAGS_MOCK, index).subscribe((response: DrawingForm[]) => {
            expect(response[0]).toEqual(expectedDrawings[0]);
            expect(response[1]).toEqual(expectedDrawings[1]);
            expect(response[2]).toEqual(expectedDrawings[2]);
        }, fail);

        const req = httpMock.expectOne((request) => request.params.has('tags') && request.params.has('index'));

        expect(req.request.method).toBe('GET');
        req.flush(expectedDrawings);
    });

    it('#deleteDrawingFromServer should not return any drawing (HttpClient called once)', () => {
        // tslint:disable-next-line: no-empty
        service.deleteDrawingFromServer(ID).subscribe(() => {}, fail);

        const req = httpMock.expectOne(baseUrl + '/delete/' + ID);
        expect(req.request.method).toBe('DELETE');
    });

    it('should handle error safely', () => {
        const UNHANDLED_ERROR = 300;
        // TODO: not sure how to test line 45. i dont think it is a good test.
        service.requestDrawingsFromServer(TAGS_MOCK, index).subscribe((response: DrawingForm[]) => {
            expect(response).toBeUndefined(); // it shounld not be undefiend.
        }, fail);

        const req = httpMock.expectOne((request) => request.params.has('tags') && request.params.has('index'));
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('fake error'), { status: UNHANDLED_ERROR });
    });

    it('should handle http error safely when receiving a delete request and the server does not respond', () => {
        service.deleteDrawingFromServer(ID).subscribe(
            // tslint:disable-next-line: no-empty
            () => {},
            (error) => {
                expect(error).toBe("Impossible d'accéder au serveur.");
            },
            fail,
        );
        const req = httpMock.expectOne(baseUrl + '/delete/' + ID);

        expect(req.request.method).toBe('DELETE');
        req.error(new ErrorEvent('No response'), { status: NO_SERVER_RESPONSE });
    });

    it('should handle http error safely when receiving a delete request that returns a INTERNAL_SERVER_ERROR code ', () => {
        service.deleteDrawingFromServer(ID).subscribe(
            // tslint:disable-next-line: no-empty
            () => {},
            (error) => {
                expect(error).toBe('Impossible de supprimer le dessin sur le serveur.');
            },
            fail,
        );
        const req = httpMock.expectOne(baseUrl + '/delete/' + ID);

        expect(req.request.method).toBe('DELETE');
        req.error(new ErrorEvent('error'), { status: Httpstatus.StatusCodes.INTERNAL_SERVER_ERROR });
    });

    it('should handle http error safely when receiving a delete request that returns a NOT_FOUND code ', () => {
        service.deleteDrawingFromServer(ID).subscribe(
            // tslint:disable-next-line: no-empty
            () => {},
            (error) => {
                expect(error).toBe('Impossible de supprimer les informations du dessin sur la base de données.');
            },
            fail,
        );
        const req = httpMock.expectOne(baseUrl + '/delete/' + ID);

        expect(req.request.method).toBe('DELETE');
        req.error(new ErrorEvent('error'), { status: Httpstatus.StatusCodes.NOT_FOUND });
    });

    it('should handle http error safely when receiving a delete request that returns a BAD_GATEWAY code ', () => {
        service.deleteDrawingFromServer(ID).subscribe(
            // tslint:disable-next-line: no-empty
            () => {},
            (error) => {
                expect(error).toBe('La suppression sur la base de donnée a échouée.');
            },
            fail,
        );
        const req = httpMock.expectOne(baseUrl + '/delete/' + ID);

        expect(req.request.method).toBe('DELETE');
        req.error(new ErrorEvent('error'), { status: Httpstatus.StatusCodes.BAD_GATEWAY });
    });

    it('should handle http error safely when receiving a get request and the server does not respond', () => {
        service.requestDrawingsFromServer(TAGS_MOCK, index).subscribe(
            (response: DrawingForm[]) => {
                expect(response).toBeUndefined();
            },
            (error) => {
                expect(error).toBe("Impossible d'accéder au serveur.");
            },
            fail,
        );

        const req = httpMock.expectOne((request) => request.params.has('tags') && request.params.has('index'));
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('No response'), { status: NO_SERVER_RESPONSE });
    });
});
