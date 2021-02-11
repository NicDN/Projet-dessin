import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';

import { HotkeyService } from './hotkey.service';

describe('HotkeyService', () => {
    let service: HotkeyService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [DrawingService],
        }).compileComponents();
    }));

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['handleNewDrawing']);
        service = TestBed.inject(HotkeyService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('ctrl functions should only be called when the ctrl key is pressed down', () => {
        const keyEvent = new KeyboardEvent('keydown', { code: 'KeyO' });
        service.handleCtrlKey(keyEvent);
        expect(drawServiceSpy.handleNewDrawing).not.toHaveBeenCalled();
    });
});
