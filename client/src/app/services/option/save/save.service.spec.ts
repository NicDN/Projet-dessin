import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DrawingForm } from '@common/communication/drawing-form';

import { SaveService } from './save.service';

// tslint:disable: no-string-literal
describe('SaveService', () => {
    let service: SaveService;
    let httpMock: HttpTestingController;
    let baseUrl = '';
    const canvasMock = document.createElement('canvas') as HTMLCanvasElement;

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
        const FILE_NAME = 'test';
        const TAGS = ['one', 'two', 'three'];
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

    // it('#handleError should handle http error safely', () => {

    // });
});
