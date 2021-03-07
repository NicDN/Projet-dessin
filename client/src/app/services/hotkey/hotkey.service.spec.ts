import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { EditorComponent } from '@app/components/editor/editor.component';
import { DialogService } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { of } from 'rxjs';
import { ColorService } from '../color/color.service';
import { PencilService } from './../tools/pencil/pencil-service';
import { HotkeyService } from './hotkey.service';

// tslint:disable: no-string-literal
describe('HotkeyService', () => {
    let service: HotkeyService;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let dialogServiceSpyObj: jasmine.SpyObj<DialogService>;
    let toolsServiceSpyObj: jasmine.SpyObj<ToolsService>;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;
    const boxSizeStub = { widthBox: 10, heightBox: 10 };
    const booleanStub = true;

    const key_S_Ctrl_Stub = new KeyboardEvent('keydown', { code: 'keyS', ctrlKey: true });

    const key_G_Ctrl_Stub = new KeyboardEvent('keydown', { code: 'keyS', ctrlKey: true });

    // const key_O_Ctrl_Stub = new KeyboardEvent('keydown', { code: 'keyS', ctrlKey: true });

    // const key_A_Stub = new KeyboardEvent('keydown', { code: 'keyS' });
    // const key_I_Stub = new KeyboardEvent('keydown', { code: 'keyS' });

    // const key_E_Stub = new KeyboardEvent('keydown', { code: 'keyS' });
    // const key_E_Ctrl_Stub = new KeyboardEvent('keydown', { code: 'keyS', ctrlKey: true });

    // const key_L_Stub = new KeyboardEvent('keydown', { code: 'keyS' });
    // const key_C_Stub = new KeyboardEvent('keydown', { code: 'keyS' });

    // const key_Z_Stub = new KeyboardEvent('keydown', { code: 'keyS' });
    // const key_Z_Ctrl_Stub = new KeyboardEvent('keydown', { code: 'keyS', ctrlKey: true });

    // const digit_1_Stub = new KeyboardEvent('keydown', { code: 'keyS' });
    // const digit_2_stub = new KeyboardEvent('keydown', { code: 'keyS' });
    // const digit_3_stub = new KeyboardEvent('keydown', { code: 'keyS' });

    // const noCtrlKeyEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: false });
    // let ctrlKeyEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: true });

    // spy.calls.reset
    beforeEach(async(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['handleNewDrawing', 'newIncomingResizeSignals']);
        dialogServiceSpyObj = jasmine.createSpyObj('DialogService', ['openDialog', 'listenToKeyEvents']);
        toolsServiceSpyObj = jasmine.createSpyObj('ToolsService', ['setCurrentTool', 'onKeyDown']);
        toolsServiceSpyObj.currentTool = new PencilService(drawingServiceSpyObj, new ColorService(), undoRedoServiceSpyObj);
        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', ['undo', 'redo']);
        drawingServiceSpyObj.newIncomingResizeSignals.and.returnValue(of(boxSizeStub));
        dialogServiceSpyObj.listenToKeyEvents.and.returnValue(of(booleanStub));

        TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            imports: [RouterTestingModule.withRoutes([{ path: 'editor', component: EditorComponent }])],
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: ToolsService, useValue: toolsServiceSpyObj },
                { provide: DialogService, useValue: dialogServiceSpyObj },
                { provide: UndoRedoService, useValue: undoRedoServiceSpyObj },
                { provide: MatDialog, useValue: {} },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        service = TestBed.inject(HotkeyService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call every function', () => {
        service.onKeyDown(key_S_Ctrl_Stub);
        expect(dialogServiceSpyObj.openDialog).toHaveBeenCalled();
        dialogServiceSpyObj.openDialog.calls.reset();
        service.onKeyDown(key_G_Ctrl_Stub);
        expect(dialogServiceSpyObj.openDialog).toHaveBeenCalledTimes(1);
    });

    // it('#verifyCtrlKeyStatus should not return if ctrl key is pressed', () => {
    //     service.ctrlKeyPressed = false;
    //     spyOn(ctrlKeyEvent, 'preventDefault').and.stub();
    //     service.verifyCtrlKeyStatus(ctrlKeyEvent);
    //     expect(ctrlKeyEvent.preventDefault).toHaveBeenCalled();
    //     expect(service.ctrlKeyPressed).toBeTrue();
    // });

    // it('#verifyCtrlKeyStatus should return if crtl key is not pressed', () => {
    //     service.ctrlKeyPressed = true;
    //     spyOn(noCtrlKeyEvent, 'preventDefault').and.stub();
    //     service.verifyCtrlKeyStatus(noCtrlKeyEvent);
    //     expect(noCtrlKeyEvent.preventDefault).not.toHaveBeenCalled();
    //     expect(service.ctrlKeyPressed).toBeFalse();
    // });

    // // tslint:disable: no-magic-numbers
    // it('#onKeyDown should call #setCurrentTool from toolservice when a tool key is pressed', () => {
    //     const toolServiceSpy: jasmine.Spy = spyOn(service['toolService'], 'setCurrentTool').and.stub();
    //     const getCurrentToolSpy = spyOn(service['toolService']['currentTool'], 'onKeyDown').and.stub();

    //     const eraserKeyboardEvent = new KeyboardEvent('keydown', { code: 'KeyE', ctrlKey: false });
    //     const pencilKeyboardEvent = new KeyboardEvent('keydown', { code: 'KeyC', ctrlKey: false });
    //     const lineKeyboardEvent = new KeyboardEvent('keydown', { code: 'KeyL', ctrlKey: false });
    //     const ellipseKeyboardEvent = new KeyboardEvent('keydown', { code: 'Digit2', ctrlKey: false });
    //     const rectangleKeyboardEvent = new KeyboardEvent('keydown', { code: 'Digit1', ctrlKey: false });

    //     service.onKeyDown(eraserKeyboardEvent);
    //     expect(toolServiceSpy).toHaveBeenCalledTimes(1);
    //     expect(getCurrentToolSpy).toHaveBeenCalledTimes(1);

    //     service.onKeyDown(pencilKeyboardEvent);
    //     expect(toolServiceSpy).toHaveBeenCalledTimes(2);
    //     expect(getCurrentToolSpy).toHaveBeenCalledTimes(2);

    //     service.onKeyDown(lineKeyboardEvent);
    //     expect(toolServiceSpy).toHaveBeenCalledTimes(3);
    //     expect(getCurrentToolSpy).toHaveBeenCalledTimes(3);

    //     service.onKeyDown(ellipseKeyboardEvent);
    //     expect(toolServiceSpy).toHaveBeenCalledTimes(4);
    //     expect(getCurrentToolSpy).toHaveBeenCalledTimes(4);

    //     service.onKeyDown(rectangleKeyboardEvent);
    //     expect(toolServiceSpy).toHaveBeenCalledTimes(5);
    //     expect(getCurrentToolSpy).toHaveBeenCalledTimes(5);
    // });

    // it('#handleCtrlO should call #handleNewDrawing if ctrl key is pressed', () => {
    //     const drawingServiceSpy: jasmine.Spy = spyOn(service.drawingService, 'handleNewDrawing');
    //     service.onKeyDown(ctrlKeyEvent);
    //     expect(drawingServiceSpy).toHaveBeenCalled();
    // });

    // it('#handleCtrlO should not call #handleNewDrawing if ctrl key is not pressed', () => {
    //     const drawingServiceSpy: jasmine.Spy = spyOn(service.drawingService, 'handleNewDrawing');
    //     service.onKeyDown(noCtrlKeyEvent);
    //     expect(drawingServiceSpy).not.toHaveBeenCalled();
    // });

    // it('#onKeyDown should be falsy if an unknown keyboard event is passed', () => {
    //     const notAssignedKeyboardEvent = new KeyboardEvent('keydown', { code: 'KeyJ', ctrlKey: false });
    //     expect(service.onKeyDown(notAssignedKeyboardEvent)).toBeFalsy();
    // });

    // it('#handleCtrlO ctrl O should call handleNewDrawing from drawingService', () => {
    //     // tslint:disable-next-line: no-any
    //     const drawingServiceSpy: jasmine.Spy<any> = spyOn<any>(service.drawingService, 'handleNewDrawing');
    //     ctrlKeyEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: true });
    //     service.onKeyDown(ctrlKeyEvent);
    //     expect(drawingServiceSpy).toHaveBeenCalled();
    // });

    // it('#onKeyDown should be falsy if an unknown keyboard event is passed', () => {
    //     const notAssignedKeyboardEvent = new KeyboardEvent('keydown', { code: 'KeyJ', ctrlKey: false });
    //     expect(service.onKeyDown(notAssignedKeyboardEvent)).toBeFalsy();
    // });
});
