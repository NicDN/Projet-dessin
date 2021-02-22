import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';

import { ExportService } from './export.service';

describe('ExportService', () => {
    let service: ExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: MatDialog, useValue: {} }],
        });
        service = TestBed.inject(ExportService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
