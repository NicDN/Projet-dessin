import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DrawingForm } from '@common/communication/drawing-form';
import * as Httpstatus from 'http-status-codes';

import { SaveService } from './save.service';

// tslint:disable: no-string-literal
describe('SaveService', () => {
    let service: SaveService;
    let httpMock: HttpTestingController;
    let baseUrl = '';

    const NO_SERVER_RESPONSE = 0;

    const canvasMock = document.createElement('canvas') as HTMLCanvasElement;
    const FILE_NAME = 'test';
    const TAGS = ['one', 'two', 'three'];

    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['']);
        drawingServiceSpyObj.canvas = canvasMock;

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: MatDialog, useValue: {} },
                { provide: DrawingService, useValue: drawingServiceSpyObj },
            ],
        });
        service = TestBed.inject(SaveService);
        httpMock = TestBed.inject(HttpTestingController);
        baseUrl = service['BASE_URL'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#postDrawing should not return any drawing when sending a POST request (HttpClient called once) ', () => {
        // tslint:disable-next-line: no-empty
        service.postDrawing(FILE_NAME, TAGS).subscribe(() => {}, fail);

        const req = httpMock.expectOne(baseUrl + '/upload');
        expect(req.request.method).toBe('POST');

        const drawingForm: DrawingForm = {
            id: '-1',
            name: FILE_NAME,
            tags: TAGS,
            drawingData: drawingServiceSpyObj.canvas.toDataURL(),
        };
        req.flush(drawingForm);
    });

    it('should handle http error safely when receiving a post request and the server does not respond', () => {
        service.postDrawing(FILE_NAME, TAGS).subscribe(
            // tslint:disable-next-line: no-empty
            () => {},
            (error) => {
                expect(error).toBe("Impossible d'accéder au serveur.");
            },
            fail,
        );
        const req = httpMock.expectOne(baseUrl + '/upload');

        expect(req.request.method).toBe('POST');
        req.error(new ErrorEvent('No response'), { status: NO_SERVER_RESPONSE });
    });

    it('should handle http error safely when receiving a post request thats returns BAD_GATEWAY code ', () => {
        service.postDrawing(FILE_NAME, TAGS).subscribe(
            // tslint:disable-next-line: no-empty
            () => {},
            (error) => {
                expect(error).toBe('La sauvegarde du dessin sur le serveur a échouée.');
            },
            fail,
        );
        const req = httpMock.expectOne(baseUrl + '/upload');

        expect(req.request.method).toBe('POST');
        req.error(new ErrorEvent('error'), { status: Httpstatus.StatusCodes.BAD_GATEWAY });
    });

    it('should handle http error safely when receiving a post request thats returns INTERNAL_SERVER_ERROR code ', () => {
        service.postDrawing(FILE_NAME, TAGS).subscribe(
            // tslint:disable-next-line: no-empty
            () => {},
            (error) => {
                expect(error).toBe('La sauvegarde des informations sur la base de données a échouée');
            },
            fail,
        );
        const req = httpMock.expectOne(baseUrl + '/upload');

        expect(req.request.method).toBe('POST');
        req.error(new ErrorEvent('error'), { status: Httpstatus.StatusCodes.INTERNAL_SERVER_ERROR });
    });

    it('should handle error safely', () => {
        const UNHANDLED_ERROR = 300;
        // TODO: not sure how to test line 45. i dont think it is a good test.
        service.postDrawing(FILE_NAME, TAGS).subscribe((response) => {
            expect(response).toBeUndefined(); // it shounld not be undefiend.
        }, fail);

        const req = httpMock.expectOne(baseUrl + '/upload');

        expect(req.request.method).toBe('POST');
        req.error(new ErrorEvent('error'), { status: UNHANDLED_ERROR });
    });
});
