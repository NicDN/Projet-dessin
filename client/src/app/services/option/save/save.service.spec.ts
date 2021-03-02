import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';

import { SaveService } from './save.service';

describe('SaveService', () => {
    let service: SaveService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: MatDialog, useValue: {} }],
        });
        service = TestBed.inject(SaveService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
