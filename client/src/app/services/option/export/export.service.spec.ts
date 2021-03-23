import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ExportService } from './export.service';

// tslint:disable: no-string-literal
describe('ExportService', () => {
    let service: ExportService;
    const canvasMock = document.createElement('canvas');
    const PNG_FILE_FORMAT = 'png';
    const JPEG_FILE_FORMAT = 'jpeg';
    const FILE_NAME = 'test';

    let exportLink=document.createElement('a');

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: MatDialog, useValue: {} }],
        });
        service = TestBed.inject(ExportService);
        service.canvasToExport = canvasMock;
        service['exportLink']=exportLink;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#exportCanvas should export canvas to jpeg if jpeg format is provided by the user', () => {
        spyOn(service['exportLink'], 'click');
        spyOn(service.canvasToExport, 'toBlob');
        service.exportCanvas(FILE_NAME, JPEG_FILE_FORMAT);
        expect(service['exportLink'].getAttribute('download')).toBe(FILE_NAME + '.' + JPEG_FILE_FORMAT);
        expect(service['downloadFormat']).toBe('image/jpeg');
        expect(service.canvasToExport.toBlob).toHaveBeenCalled();
    });

    it('#exportCanvas should export canvas to png if png format is provided by the user', () => {
        spyOn(service['exportLink'], 'click');
        spyOn(service.canvasToExport, 'toBlob');
        service.exportCanvas(FILE_NAME, PNG_FILE_FORMAT);
        expect(service['exportLink'].getAttribute('download')).toBe(FILE_NAME + '.' + PNG_FILE_FORMAT);
        expect(service['downloadFormat']).toBe('image/png');
        expect(service.canvasToExport.toBlob).toHaveBeenCalled();
    });

    it('#exportCanvas should set the file name to the default name if a file name is not provided', () => {
        spyOn(service['exportLink'], 'click');
        const DEFAULT_FILE_NAME = 'Sans titre';
        const NOT_PROVIDED_FILE_NAME = '';
        service.exportCanvas(NOT_PROVIDED_FILE_NAME, PNG_FILE_FORMAT);
        expect(service['exportLink'].getAttribute('download')).toBe(DEFAULT_FILE_NAME + '.' + PNG_FILE_FORMAT);
    });
});
