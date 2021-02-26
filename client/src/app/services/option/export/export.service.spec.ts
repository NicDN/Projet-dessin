import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';

import { ExportService } from './export.service';

// tslint:disable: no-string-literal
describe('ExportService', () => {
    let service: ExportService;
    const canvasMock = document.createElement('canvas');
    const PNG_FILE_FORMAT = 'png';
    const JPG_FILE_FORMAT = 'png';

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: MatDialog, useValue: {} }],
        });
        service = TestBed.inject(ExportService);
        service.canvasToExport = canvasMock;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#exportCanvas should export the canvas whith the right filename and right format ', () => {
        // exporting with png format
        const FILE_NAME = 'test';
        service.exportCanvas(FILE_NAME, PNG_FILE_FORMAT);
        expect(service['exportLink'].getAttribute('download')).toBe(FILE_NAME + '.' + PNG_FILE_FORMAT);

        // exporting with jpg format
        service.exportCanvas(FILE_NAME, JPG_FILE_FORMAT);
        expect(service['exportLink'].getAttribute('download')).toBe(FILE_NAME + '.' + JPG_FILE_FORMAT);
    });

    it('#exportCanvas should set the file name to the default name if a file name is not provided', () => {
        const DEFAULT_FILE_NAME = 'Sans titre';
        const NOT_PROVIDED_FILE_NAME = '';
        service.exportCanvas(NOT_PROVIDED_FILE_NAME, PNG_FILE_FORMAT);
        expect(service['exportLink'].getAttribute('download')).toBe(DEFAULT_FILE_NAME + '.' + PNG_FILE_FORMAT);
    });
});
