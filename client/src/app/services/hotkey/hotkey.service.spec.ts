import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { EditorComponent } from '@app/components/editor/editor.component';
import { MainPageComponent } from '@app/components/main-page/main-page.component';
import { ClipboardSelectionService } from '@app/services/clipboard-selection/clipboard-selection.service';
import { ColorService } from '@app/services/color/color.service';
import { DialogService, DialogType } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle/rectangle-selection.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { PencilService } from '@app/services/tools/trace-tool/pencil/pencil.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { of } from 'rxjs';
import { HotkeyService } from './hotkey.service';

// tslint:disable: no-string-literal
// tslint:disable: no-any
describe('HotkeyService', () => {
    let service: HotkeyService;

    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let dialogServiceSpyObj: jasmine.SpyObj<DialogService>;
    let toolsServiceSpyObj: jasmine.SpyObj<ToolsService>;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;
    let rectangleSelectionServiceSpyObj: jasmine.SpyObj<RectangleSelectionService>;
    let clipboardSelectionServiceSpyObj: jasmine.SpyObj<ClipboardSelectionService>;
    let gridServiceSpyObj: jasmine.SpyObj<GridService>;

    const boxSizeStub = { widthBox: 10, heightBox: 10 };
    const booleanStub = true;

    const keySCtrlStub = new KeyboardEvent('keydown', { code: 'KeyS', ctrlKey: true });

    const keyGCtrlStub = new KeyboardEvent('keydown', { code: 'KeyG', ctrlKey: true });

    const keyOCtrlStub = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: true });

    const keyAStub = new KeyboardEvent('keydown', { code: 'KeyA' });
    const keyCtrlAStub = new KeyboardEvent('keydown', { code: 'KeyA', ctrlKey: true });

    const keyIStub = new KeyboardEvent('keydown', { code: 'KeyI' });

    const keyEStub = new KeyboardEvent('keydown', { code: 'KeyE' });
    const keyECtrlStub = new KeyboardEvent('keydown', { code: 'KeyE', ctrlKey: true });

    const keyRStub = new KeyboardEvent('keydown', { code: 'KeyR' });
    const keySStub = new KeyboardEvent('keydown', { code: 'KeyS' });

    const keyLStub = new KeyboardEvent('keydown', { code: 'KeyL' });

    const keyCStub = new KeyboardEvent('keydown', { code: 'KeyC' });
    const keyCCtrlStub = new KeyboardEvent('keydown', { code: 'KeyC', ctrlKey: true });

    const keyXCtrlStub = new KeyboardEvent('keydown', { code: 'KeyX', ctrlKey: true });

    const keyDeleteStub = new KeyboardEvent('keydown', { code: 'Delete' });
    const keyVCtrlStub = new KeyboardEvent('keydown', { code: 'KeyV', ctrlKey: true });

    const keyCtrlZStub = new KeyboardEvent('keydown', { code: 'KeyZ', ctrlKey: true });
    const keyZCtrlShiftStub = new KeyboardEvent('keydown', { code: 'KeyZ', ctrlKey: true, shiftKey: true });

    const digit1Stub = new KeyboardEvent('keydown', { code: 'Digit1' });
    const digit2Stub = new KeyboardEvent('keydown', { code: 'Digit2' });
    const digit3Stub = new KeyboardEvent('keydown', { code: 'Digit3' });

    const keyTStub = new KeyboardEvent('keydown', { code: 'KeyT' });
    const keyVStub = new KeyboardEvent('keydown', { code: 'KeyV' });
    const keyGStub = new KeyboardEvent('keydown', { code: 'KeyG' });
    const keyBStub = new KeyboardEvent('keydown', { code: 'KeyB' });
    const keyDStub = new KeyboardEvent('keydown', { code: 'KeyD' });

    const noCtrlKeyOEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: false });
    const randomKeyEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: true });

    const equalStub = new KeyboardEvent('keydown', { code: 'Equal' });
    const plusStub = new KeyboardEvent('keydown', { code: 'Equal', shiftKey: true });
    const minusStub = new KeyboardEvent('keydown', { code: 'Minus' });

    beforeEach(async(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['handleNewDrawing', 'newIncomingResizeSignals', 'updateGrid']);
        dialogServiceSpyObj = jasmine.createSpyObj('DialogService', ['openDialog', 'listenToKeyEvents']);
        rectangleSelectionServiceSpyObj = jasmine.createSpyObj('RectangleSelectionService', ['selectAll']);
        toolsServiceSpyObj = jasmine.createSpyObj('ToolsService', ['setCurrentTool', 'onKeyDown']);
        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', ['undo', 'redo']);
        clipboardSelectionServiceSpyObj = jasmine.createSpyObj('ClipboardSelectionService', ['copy', 'cut', 'delete', 'paste']);
        gridServiceSpyObj = jasmine.createSpyObj('GridService', ['handleDrawGrid', 'incrementSquareSize', 'decrementSquareSize']);

        toolsServiceSpyObj.currentTool = new PencilService(drawingServiceSpyObj, new ColorService(), undoRedoServiceSpyObj);
        drawingServiceSpyObj.newIncomingResizeSignals.and.returnValue(of(boxSizeStub));
        dialogServiceSpyObj['listenToKeyEvents'].and.returnValue(of(booleanStub));

        TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            imports: [
                RouterTestingModule.withRoutes([
                    { path: 'home', component: MainPageComponent },
                    { path: 'editor', component: EditorComponent },
                ]),
            ],
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: ToolsService, useValue: toolsServiceSpyObj },
                { provide: DialogService, useValue: dialogServiceSpyObj },
                { provide: UndoRedoService, useValue: undoRedoServiceSpyObj },
                { provide: RectangleSelectionService, useValue: rectangleSelectionServiceSpyObj },
                { provide: ClipboardSelectionService, useValue: clipboardSelectionServiceSpyObj },
                { provide: GridService, useValue: gridServiceSpyObj },
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

    it(
        '#initializeShorcutManager should initiate and be able to be called when on #onKey is pressed with the appropriate keyCode' +
            ' should call every function',
        () => {
            spyOn<any>(service, 'handleCtrlO');
            spyOn<any>(service, 'handleSelectAll');
            spyOn<any>(service, 'handleIncrementingSquareSize');
            spyOn<any>(service, 'handleDecrementingSquareSize');
            service['listenToKeyEvents'] = true;

            service.onKeyDown(keySCtrlStub);
            expect(dialogServiceSpyObj.openDialog).toHaveBeenCalledWith(DialogType.Save);

            service.onKeyDown(keyGCtrlStub);
            expect(dialogServiceSpyObj.openDialog).toHaveBeenCalledWith(DialogType.Carousel);

            service.onKeyDown(keyOCtrlStub);
            expect(service['handleCtrlO']).toHaveBeenCalled();

            service.onKeyDown(keyAStub);
            expect(toolsServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolsServiceSpyObj.sprayCanService);

            service.onKeyDown(keyIStub);
            expect(toolsServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolsServiceSpyObj.eyeDropperService);

            service.onKeyDown(keyEStub);
            expect(toolsServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolsServiceSpyObj.eraserService);

            service.onKeyDown(keyECtrlStub);
            expect(dialogServiceSpyObj.openDialog).toHaveBeenCalledWith(DialogType.Export);

            service.onKeyDown(keyLStub);
            expect(toolsServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolsServiceSpyObj.lineService);

            service.onKeyDown(keyCStub);
            expect(toolsServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolsServiceSpyObj.pencilService);

            service.onKeyDown(keyCtrlZStub);
            expect(undoRedoServiceSpyObj.undo).toHaveBeenCalled();
            undoRedoServiceSpyObj.undo.calls.reset();

            service.onKeyDown(keyZCtrlShiftStub);
            expect(undoRedoServiceSpyObj.redo).toHaveBeenCalled();
            undoRedoServiceSpyObj.redo.calls.reset();

            service.onKeyDown(digit1Stub);
            expect(toolsServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolsServiceSpyObj.rectangleDrawingService);

            service.onKeyDown(digit2Stub);
            expect(toolsServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolsServiceSpyObj.ellipseDrawingService);

            service.onKeyDown(digit3Stub);
            expect(toolsServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolsServiceSpyObj.polygonService);

            service.onKeyDown(keySStub);
            expect(toolsServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolsServiceSpyObj.ellipseDrawingService);

            service.onKeyDown(keyRStub);
            expect(toolsServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolsServiceSpyObj.rectangleDrawingService);

            service.onKeyDown(keyTStub);
            expect(toolsServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolsServiceSpyObj.textService);

            service.onKeyDown(keyVStub);
            expect(toolsServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolsServiceSpyObj.lassoSelectionService);

            service.onKeyDown(keyGStub);
            expect(toolsServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolsServiceSpyObj.gridService);
            expect(gridServiceSpyObj.handleDrawGrid).toHaveBeenCalled();

            service.onKeyDown(keyBStub);
            expect(toolsServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolsServiceSpyObj.fillDripService);

            service.onKeyDown(keyDStub);
            expect(toolsServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolsServiceSpyObj.stampService);

            service.onKeyDown(keyCtrlAStub);
            expect(service['handleSelectAll']).toHaveBeenCalled();

            service.onKeyDown(keyCCtrlStub);
            expect(clipboardSelectionServiceSpyObj.copy).toHaveBeenCalled();

            service.onKeyDown(keyXCtrlStub);
            expect(clipboardSelectionServiceSpyObj.cut).toHaveBeenCalled();

            service.onKeyDown(keyDeleteStub);
            expect(clipboardSelectionServiceSpyObj.delete).toHaveBeenCalled();

            service.onKeyDown(keyVCtrlStub);
            expect(clipboardSelectionServiceSpyObj.paste).toHaveBeenCalled();

            service.onKeyDown(equalStub);
            expect(service['handleIncrementingSquareSize']).toHaveBeenCalled();

            service.onKeyDown(plusStub);
            expect(service['handleIncrementingSquareSize']).toHaveBeenCalled();

            service.onKeyDown(minusStub);
            expect(service['handleDecrementingSquareSize']).toHaveBeenCalled();
        },
    );

    it('#handleCtrlO should call #handleNewDrawing if ctrl key is pressed and its on the editor component', () => {
        spyOn<any>(service, 'currentRouteIsEditor').and.returnValue(true);
        service['handleCtrlO']();
        expect(drawingServiceSpyObj.handleNewDrawing).toHaveBeenCalled();
    });

    it('#handleCtrlO should rereoute to editor if it was not on that route', () => {
        spyOn<any>(service, 'currentRouteIsEditor').and.returnValue(false);
        const navigateSpyObj = spyOn(service['router'], 'navigate').and.returnValues();
        service['handleCtrlO']();
        expect(navigateSpyObj).toHaveBeenCalled();
    });

    it('#handleCtrlO should not call #handleNewDrawing if ctrl key is not pressed', () => {
        spyOn<any>(service, 'currentRouteIsEditor').and.returnValue(true);
        service.onKeyDown(noCtrlKeyOEvent);
        expect(drawingServiceSpyObj.handleNewDrawing).not.toHaveBeenCalled();
    });

    it('#currentRouteIsEditor should return true if current route is editor', () => {
        const urlStub = '/editor';
        expect(service['currentRouteIsEditor'](urlStub)).toBeTrue();
    });

    it('#currentRouteIsEditor should return false if current route is editor', () => {
        const urlStub = '/notEditor';
        expect(service['currentRouteIsEditor'](urlStub)).toBeFalse();
    });

    it('#onKeyDown should not go through if it is not listening to key events', () => {
        spyOn(toolsServiceSpyObj.currentTool, 'onKeyDown');
        service['listenToKeyEvents'] = false;
        service.onKeyDown(randomKeyEvent);
        expect(toolsServiceSpyObj.currentTool.onKeyDown).not.toHaveBeenCalled();
    });

    it('#onKeyDown should preventDefault if alt key is pressed', () => {
        const event = new KeyboardEvent('keyDown', { altKey: true });
        spyOn(event, 'preventDefault');
        service.onKeyDown(event);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('#onKeyDown should not preventDefault if alt key is not pressed', () => {
        const event = new KeyboardEvent('keyDown', { altKey: false });
        spyOn(event, 'preventDefault');
        service.onKeyDown(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('#onKeyDown should be falsy if an unknown keyboard event is passed', () => {
        service['listenToKeyEvents'] = true;
        const notAssignedKeyboardEvent1 = new KeyboardEvent('keydown', { code: 'KeyJ', ctrlKey: true, shiftKey: true });
        const notAssignedKeyboardEvent2 = new KeyboardEvent('keydown', { code: 'KeyJ', ctrlKey: false });
        const notAssignedKeyboardEvent3 = new KeyboardEvent('keydown', { code: 'KeyJ', ctrlKey: true, shiftKey: false });
        expect(service.onKeyDown(notAssignedKeyboardEvent1)).toBeFalsy();
        expect(service.onKeyDown(notAssignedKeyboardEvent2)).toBeFalsy();
        expect(service.onKeyDown(notAssignedKeyboardEvent3)).toBeFalsy();
    });

    it('#onKeyDown should be falsy if a shift key event event is passed', () => {
        service['listenToKeyEvents'] = true;
        const knownshiftKeyEvent = new KeyboardEvent('keydown', { code: 'KeyP', ctrlKey: false, shiftKey: true });
        expect(service.onKeyDown(knownshiftKeyEvent)).toBeFalsy();
    });

    it('#handleSelectAll should call appropriate function to select all drawing', () => {
        service['handleSelectAll']();
        expect(toolsServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolsServiceSpyObj.rectangleSelectionService);
        expect(rectangleSelectionServiceSpyObj.selectAll).toHaveBeenCalled();
    });

    it(
        '#handleIncrementingSquareSize should call appropriate function to increment the squareSize' + 'if it is less then the maximum square size',
        () => {
            service['handleIncrementingSquareSize']();
            expect(toolsServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolsServiceSpyObj.gridService);
            expect(gridServiceSpyObj.incrementSquareSize).toHaveBeenCalled();
            expect(drawingServiceSpyObj.updateGrid).toHaveBeenCalledWith();
        },
    );

    it(
        '#handleDecrementingSquareSize should call appropriate function to decrement the squareSize' + 'if it is more then the minimum square size',
        () => {
            service['handleDecrementingSquareSize']();
            expect(toolsServiceSpyObj.setCurrentTool).toHaveBeenCalledWith(toolsServiceSpyObj.gridService);
            expect(gridServiceSpyObj.decrementSquareSize).toHaveBeenCalled();
            expect(drawingServiceSpyObj.updateGrid).toHaveBeenCalledWith();
        },
    );
});
