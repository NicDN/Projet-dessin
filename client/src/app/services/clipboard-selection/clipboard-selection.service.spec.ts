import { TestBed } from '@angular/core/testing';
import { ClipboardSelectionService } from './clipboard-selection.service';

describe('ClipboardService', () => {
    let service: ClipboardSelectionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ClipboardSelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
