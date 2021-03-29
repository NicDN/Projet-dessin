// import { HttpHeaders } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ExportService, ImgurResponse } from './export.service';

// tslint:disable: no-string-literal
fdescribe('ExportService', () => {
    let service: ExportService;
    const canvasMock = document.createElement('canvas');
    const PNG_FILE_FORMAT = 'png';
    const JPEG_FILE_FORMAT = 'jpeg';
    const FILE_NAME = 'test';

    // let httpMock: HttpTestingController;

    const exportLink = document.createElement('a');

    const EXPECTED_URL = 'expected url';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: MatDialog, useValue: {} }],
        });
        // httpMock = TestBed.inject(HttpTestingController);
        service = TestBed.inject(ExportService);
        service.canvasToExport = canvasMock;
        service['exportLink'] = exportLink;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#handleLocalExport should export canvas to jpeg if jpeg format is provided by the user', () => {
        spyOn(service.canvasToExport, 'toBlob');
        service.handleLocalExport(FILE_NAME, JPEG_FILE_FORMAT);
        expect(service['exportLink'].getAttribute('download')).toBe(FILE_NAME + '.' + JPEG_FILE_FORMAT);
        expect(service['downloadFormat']).toBe('image/jpeg');
        expect(service.canvasToExport.toBlob).toHaveBeenCalled();
    });

    it('#handleLocalExport should export canvas to png if png format is provided by the user', () => {
        spyOn(service.canvasToExport, 'toBlob');
        service.handleLocalExport(FILE_NAME, PNG_FILE_FORMAT);
        expect(service['exportLink'].getAttribute('download')).toBe(FILE_NAME + '.' + PNG_FILE_FORMAT);
        expect(service['downloadFormat']).toBe('image/png');
        expect(service.canvasToExport.toBlob).toHaveBeenCalled();
    });

    it('#handleLocalExport should set the file name to the default name if a file name is not provided', () => {
        spyOn(service.canvasToExport, 'toBlob').and.callThrough();
        const DEFAULT_FILE_NAME = 'Sans titre';
        const NOT_PROVIDED_FILE_NAME = '';
        service.handleLocalExport(NOT_PROVIDED_FILE_NAME, PNG_FILE_FORMAT);
        expect(service['exportLink'].getAttribute('download')).toBe(DEFAULT_FILE_NAME + '.' + PNG_FILE_FORMAT);
    });

    // it('#handleImgurExport should return the correct url of the uploaded image ', async () => {
    //     const imgurResponse: ImgurResponse = {
    //         data: {
    //             link: EXPECTED_URL,
    //         },
    //         success: true,
    //     } as ImgurResponse;

    //     // const imgurData = new FormData();
    //     // imgurData.append('image', 'fake blob');
    //     // const headers = new HttpHeaders({ Authorization: 'Client-ID ' + service['CLIENT_ID'] });

    //     await service.handleImgurExport(JPEG_FILE_FORMAT).then((url) => {
    //         expect(url).toBe(EXPECTED_URL);
    //     });

    //     const req = httpMock.expectOne(service['IMGUR_UPLOAD_URL']);

    //     expect(req.request.method).toBe('POST');
    //     req.flush(imgurResponse);
    // });

    it('#handleImgurExport should return the correct url of the uploaded image ', async () => {
        const imgurResponse: ImgurResponse = {
            data: {
                link: EXPECTED_URL,
            },
            success: true,
        } as ImgurResponse;

        spyOn(service['http'], 'post').and.returnValue(of(imgurResponse));
        await expectAsync(service.handleImgurExport(PNG_FILE_FORMAT)).toBeResolvedTo(EXPECTED_URL);
    });

    it('#handleImgurExport promise should be rejected if a error occured while uploading ', async () => {
        spyOn(service['http'], 'post').and.returnValue(of(new Error('fake error')));
        await expectAsync(service.handleImgurExport(PNG_FILE_FORMAT)).toBeRejected();
    });

    it('#handleImgurExport promise should be rejected if the upload has not succeded', async () => {
        const unsuccesfulResponse: ImgurResponse = {
            data: {
                link: '',
            },
            success: false,
        } as ImgurResponse;

        spyOn(service['http'], 'post').and.returnValue(of(unsuccesfulResponse));
        await expectAsync(service.handleImgurExport(PNG_FILE_FORMAT)).toBeRejected();
    });
});
