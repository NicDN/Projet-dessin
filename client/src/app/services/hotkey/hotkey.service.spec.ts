import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { HotkeyService } from './hotkey.service';
// import SpyObj = jasmine.SpyObj;

describe('HotkeyService', () => {
    let service: HotkeyService;
    let fixture: ComponentFixture<DrawingComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            imports: [RouterTestingModule],
            providers: [DrawingService, ToolsService],
        }).compileComponents();
    }));

    beforeEach(() => {
        service = TestBed.inject(HotkeyService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('ctrl functions should only be called when the ctrl key is pressed down', () => {
        // tslint:disable-next-line: no-any
        const drawingServiceSpy: jasmine.Spy<any> = spyOn<any>(service.drawingService, 'handleNewDrawing');
        const ctrlKeyEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: true });

        const noCtrlKeyEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: false });
        service.onKeyDown(noCtrlKeyEvent);
        expect(drawingServiceSpy).not.toHaveBeenCalled();

        service.onKeyDown(ctrlKeyEvent);
        expect(drawingServiceSpy).toHaveBeenCalled();
    });

    it('ctrl key should prevent default and then should put it back to true when done', () => {
        fixture = TestBed.createComponent(DrawingComponent);
        fixture.detectChanges();
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault'], { code: 'KeyO', ctrlKey: true });

        service.onKeyDown(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.returnValue).toEqual(true);
    });

    it('should call setCurrent tool from toolservice when a tool key is pressed', () => {
        // tslint:disable-next-line: no-any no-string-literal
        const toolServiceSpy: jasmine.Spy<any> = spyOn<any>(service['toolService'], 'setCurrentTool').and.stub();
        const eraserKeyboardEvent = new KeyboardEvent('keydown', { code: 'KeyE', ctrlKey: false });
        const pencilKeyboardEvent = new KeyboardEvent('keydown', { code: 'KeyC', ctrlKey: false });
        const lineKeyboardEvent = new KeyboardEvent('keydown', { code: 'KeyL', ctrlKey: false });
        const ellipseKeyboardEvent = new KeyboardEvent('keydown', { code: 'Digit2', ctrlKey: false });
        const rectangleeKeyboardEvent = new KeyboardEvent('keydown', { code: 'Digit1', ctrlKey: false });

        service.onKeyDown(eraserKeyboardEvent);
        expect(toolServiceSpy).toHaveBeenCalledTimes(1);

        service.onKeyDown(pencilKeyboardEvent);
        expect(toolServiceSpy).toHaveBeenCalledTimes(2);

        service.onKeyDown(lineKeyboardEvent);
        expect(toolServiceSpy).toHaveBeenCalledTimes(3);

        service.onKeyDown(ellipseKeyboardEvent);
        expect(toolServiceSpy).toHaveBeenCalledTimes(4);

        service.onKeyDown(rectangleeKeyboardEvent);
        expect(toolServiceSpy).toHaveBeenCalledTimes(5);
    });
});
