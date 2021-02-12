import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from './hotkey.service';
// import SpyObj = jasmine.SpyObj;

describe('HotkeyService', () => {
    let service: HotkeyService;
    let fixture: ComponentFixture<DrawingComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            imports: [RouterTestingModule],
            providers: [DrawingService],
        }).compileComponents();
    }));

    beforeEach(() => {
        service = TestBed.inject(HotkeyService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('ctrl functions should only be called when the ctrl key is pressed down', () => {
        const drawingServiceSpy: jasmine.Spy<any> = spyOn<any>(service.drawingService, 'handleNewDrawing');
        const ctrlKeyEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: true });
        service.onKeyDown(ctrlKeyEvent);
        expect(drawingServiceSpy).toHaveBeenCalled();
    });

    it('should not call ctrl functions when the ctrl key is not pressed down', () => {
        const drawingServiceSpy: jasmine.Spy<any> = spyOn<any>(service.drawingService, 'handleNewDrawing');
        const noCtrlKeyEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: false });
        service.onKeyDown(noCtrlKeyEvent);
        expect(drawingServiceSpy).not.toHaveBeenCalled();
    });

    it('ctrl key should prevent default and then should put it back to true', () => {
        fixture = TestBed.createComponent(DrawingComponent);
        fixture.detectChanges();
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault'], { code: 'KeyO', ctrlKey: true });
        service.onKeyDown(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.returnValue).toEqual(true);
    });
});
