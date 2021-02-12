import { DrawingService } from '@app/services/drawing/drawing.service';
import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HotkeyService } from './hotkey.service';

fdescribe('HotkeyService', () => {
    let service: HotkeyService;
    // let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [DrawingService],
        }).compileComponents();
    }));

    beforeEach(() => {
        // drawServiceSpy = jasmine.createSpyObj('DrawingService', ['handleNewDrawing']);
        service = TestBed.inject(HotkeyService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('ctrl functions should only be called when the ctrl key is pressed down', () => {
        const drawingServiceSpy: jasmine.Spy<any> = spyOn<any>(service.drawingService, 'handleNewDrawing');

        const noCtrlKeyEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: false });
        service.onKeyDown(noCtrlKeyEvent);
        expect(drawingServiceSpy).not.toHaveBeenCalled();

        const ctrlKeyEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: true });
        service.onKeyDown(ctrlKeyEvent);
        expect(drawingServiceSpy).toHaveBeenCalled();
    });
});
