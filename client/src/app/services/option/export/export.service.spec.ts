import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { ExportService, ImgurResponse } from './export.service';

// tslint:disable: no-string-literal
describe('ExportService', () => {
    let service: ExportService;
    const canvasMock = document.createElement('canvas');
    const PNG_FILE_FORMAT = 'png';
    const JPEG_FILE_FORMAT = 'jpeg';
    const FILE_NAME = 'test';
    const EXPECTED_URL = 'expected url';

    const exportLinkSpyObj = jasmine.createSpyObj('HTMLAnchorElement', ['click', 'setAttribute']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: MatDialog, useValue: {} }],
        });
        service = TestBed.inject(ExportService);
        service.canvasToExport = canvasMock;
        service['exportLink'] = exportLinkSpyObj;

        spyOn(document, 'createElement').and.returnValue(exportLinkSpyObj);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#handleLocalExport should export canvas to jpeg if jpeg format is provided by the user', () => {
        spyOn(service.canvasToExport, 'toBlob').and.callThrough();
        service.handleLocalExport(FILE_NAME, JPEG_FILE_FORMAT);

        expect(service['downloadFormat']).toBe('image/jpeg');
        expect(service.canvasToExport.toBlob).toHaveBeenCalled();
    });

    it('#handleLocalExport should export canvas to png if png format is provided by the user', () => {
        spyOn(service.canvasToExport, 'toBlob').and.callThrough();
        service.handleLocalExport(FILE_NAME, PNG_FILE_FORMAT);

        expect(service['downloadFormat']).toBe('image/png');
        expect(service.canvasToExport.toBlob).toHaveBeenCalled();
    });

    it('#handleLocalExport should set the file name to the default name if a file name is not provided', () => {
        spyOn(service.canvasToExport, 'toBlob').and.callThrough();
        const DEFAULT_FILE_NAME = 'Sans titre';
        const NOT_PROVIDED_FILE_NAME = '';
        service.handleLocalExport(NOT_PROVIDED_FILE_NAME, PNG_FILE_FORMAT);
        expect(service['fileName']).toEqual(DEFAULT_FILE_NAME);
    });

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
        spyOn(service['http'], 'post').and.returnValue(throwError('fake error'));
        await expectAsync(service.handleImgurExport(PNG_FILE_FORMAT)).toBeRejected();
    });

    it('#handleImgurExport promise should be rejected if the upload has not succeded', async () => {
        const unsuccesfulUploadResponse: ImgurResponse = {
            data: {
                link: '',
            },
            success: false,
        } as ImgurResponse;

        spyOn(service['http'], 'post').and.returnValue(of(unsuccesfulUploadResponse));
        await expectAsync(service.handleImgurExport(PNG_FILE_FORMAT)).toBeRejected();
    });
});
