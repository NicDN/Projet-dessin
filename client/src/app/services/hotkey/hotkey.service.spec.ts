import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { EditorComponent } from '@app/components/editor/editor.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { HotkeyService } from './hotkey.service';

// tslint:disable: no-string-literal
describe('HotkeyService', () => {
    let service: HotkeyService;

    const noCtrlKeyEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: false });
    let ctrlKeyEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: true });

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            imports: [RouterTestingModule.withRoutes([{ path: 'editor', component: EditorComponent }])],
            providers: [DrawingService, ToolsService],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        service = TestBed.inject(HotkeyService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#verifyCtrlKeyStatus should not return if ctrl key is pressed', () => {
        service.ctrlKeyPressed = false;
        spyOn(ctrlKeyEvent, 'preventDefault').and.stub();
        service.verifyCtrlKeyStatus(ctrlKeyEvent);
        expect(ctrlKeyEvent.preventDefault).toHaveBeenCalled();
        expect(service.ctrlKeyPressed).toBeTrue();
    });

    it('#verifyCtrlKeyStatus should return if crtl key is not pressed', () => {
        service.ctrlKeyPressed = true;
        spyOn(noCtrlKeyEvent, 'preventDefault').and.stub();
        service.verifyCtrlKeyStatus(noCtrlKeyEvent);
        expect(noCtrlKeyEvent.preventDefault).not.toHaveBeenCalled();
        expect(service.ctrlKeyPressed).toBeFalse();
    });

    // tslint:disable: no-magic-numbers
    it('#onKeyDown should call #setCurrentTool from toolservice when a tool key is pressed', () => {
        const toolServiceSpy: jasmine.Spy = spyOn(service['toolService'], 'setCurrentTool').and.stub();
        const getCurrentToolSpy = spyOn(service['toolService']['currentTool'], 'onKeyDown').and.stub();

        const eraserKeyboardEvent = new KeyboardEvent('keydown', { code: 'KeyE', ctrlKey: false });
        const pencilKeyboardEvent = new KeyboardEvent('keydown', { code: 'KeyC', ctrlKey: false });
        const lineKeyboardEvent = new KeyboardEvent('keydown', { code: 'KeyL', ctrlKey: false });
        const ellipseKeyboardEvent = new KeyboardEvent('keydown', { code: 'Digit2', ctrlKey: false });
        const rectangleKeyboardEvent = new KeyboardEvent('keydown', { code: 'Digit1', ctrlKey: false });

        service.onKeyDown(eraserKeyboardEvent);
        expect(toolServiceSpy).toHaveBeenCalledTimes(1);
        expect(getCurrentToolSpy).toHaveBeenCalledTimes(1);

        service.onKeyDown(pencilKeyboardEvent);
        expect(toolServiceSpy).toHaveBeenCalledTimes(2);
        expect(getCurrentToolSpy).toHaveBeenCalledTimes(2);

        service.onKeyDown(lineKeyboardEvent);
        expect(toolServiceSpy).toHaveBeenCalledTimes(3);
        expect(getCurrentToolSpy).toHaveBeenCalledTimes(3);

        service.onKeyDown(ellipseKeyboardEvent);
        expect(toolServiceSpy).toHaveBeenCalledTimes(4);
        expect(getCurrentToolSpy).toHaveBeenCalledTimes(4);

        service.onKeyDown(rectangleKeyboardEvent);
        expect(toolServiceSpy).toHaveBeenCalledTimes(5);
        expect(getCurrentToolSpy).toHaveBeenCalledTimes(5);
    });

    it('#handleCtrlO should call #handleNewDrawing if ctrl key is pressed', () => {
        const drawingServiceSpy: jasmine.Spy = spyOn(service.drawingService, 'handleNewDrawing');
        service.onKeyDown(ctrlKeyEvent);
        expect(drawingServiceSpy).toHaveBeenCalled();
    });

    it('#handleCtrlO should not call #handleNewDrawing if ctrl key is not pressed', () => {
        const drawingServiceSpy: jasmine.Spy = spyOn(service.drawingService, 'handleNewDrawing');
        service.onKeyDown(noCtrlKeyEvent);
        expect(drawingServiceSpy).not.toHaveBeenCalled();
    });

    it('#onKeyDown should be falsy if an unknown keyboard event is passed', () => {
        const notAssignedKeyboardEvent = new KeyboardEvent('keydown', { code: 'KeyJ', ctrlKey: false });
        expect(service.onKeyDown(notAssignedKeyboardEvent)).toBeFalsy();
    });

    it('#handleCtrlO ctrl O should call handleNewDrawing from drawingService', () => {
        // tslint:disable-next-line: no-any
        const drawingServiceSpy: jasmine.Spy<any> = spyOn<any>(service.drawingService, 'handleNewDrawing');
        ctrlKeyEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: true });
        service.onKeyDown(ctrlKeyEvent);
        expect(drawingServiceSpy).toHaveBeenCalled();
    });

    it('#onKeyDown should be falsy if an unknown keyboard event is passed', () => {
        const notAssignedKeyboardEvent = new KeyboardEvent('keydown', { code: 'KeyJ', ctrlKey: false });
        expect(service.onKeyDown(notAssignedKeyboardEvent)).toBeFalsy();
    });
});
