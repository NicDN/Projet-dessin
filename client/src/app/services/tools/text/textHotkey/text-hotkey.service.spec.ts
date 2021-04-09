import { TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TextHotkeyService } from './text-hotkey.service';

xdescribe('TextHotkeyService', () => {
    let service: TextHotkeyService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: MatBottomSheet, useValue: {} },
                { provide: MatSnackBarModule, useValue: {} },
            ],
        });
        service = TestBed.inject(TextHotkeyService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
