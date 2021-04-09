import { TestBed } from '@angular/core/testing';

import { TextHotkeyService } from './text-hotkey.service';

describe('TextHotkeyService', () => {
    let service: TextHotkeyService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TextHotkeyService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
