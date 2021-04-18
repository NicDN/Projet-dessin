import { TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { HORIZONTAL_OFFSET, VERTICAL_OFFSET } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { TextService } from './text.service';

// tslint:disable: no-string-literal no-any
describe('TextService', () => {
    let service: TextService;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;
    let colorServiceSpyObj: jasmine.SpyObj<ColorService>;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    const MOUSE_POSITION: Vec2 = { x: 25, y: 25 };
    const PRIMARY_COLOR_STUB = 'red';
    const OPACITY_STUB = 1;
    const TEXT_STUB = 25;
    const FOUR = 4;
    const THREE = 3;
    const FIVE = 5;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', ['disableUndoRedo', 'enableUndoRedo']);
        colorServiceSpyObj = jasmine.createSpyObj('ColorService', [''], {
            mainColor: { rgbValue: PRIMARY_COLOR_STUB, opacity: OPACITY_STUB },
        });
        TestBed.configureTestingModule({
            providers: [
                { provide: MatBottomSheet, useValue: {} },
                { provide: MatSnackBar, useValue: {} },
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: ColorService, useValue: colorServiceSpyObj },
                { provide: UndoRedoService, useValue: undoRedoServiceSpyObj },
            ],
        });
        service = TestBed.inject(TextService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            pageX: MOUSE_POSITION.x + HORIZONTAL_OFFSET,
            pageY: MOUSE_POSITION.y + VERTICAL_OFFSET,
        } as MouseEvent;

        spyOn<any>(service, 'disableEnableHotKeyService');
        spyOn<any>(service, 'setContextForWriting');
        spyOn<any>(service, 'displayPreviewBar');
        spyOn<any>(service, 'drawBox');
        spyOn<any>(service, 'registerTextCommand');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#onMouseDown should be setting the service ready for writing', () => {
        service.isWriting = false;
        service.onMouseDown(mouseEvent);

        expect(service.isWriting).toEqual(true);
        expect(undoRedoServiceSpyObj.disableUndoRedo).toHaveBeenCalled();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(service['disableEnableHotKeyService']).toHaveBeenCalledWith(false);
        expect(service['setContextForWriting']).toHaveBeenCalled();
        expect(service['displayPreviewBar']).toHaveBeenCalled();
        expect(service['drawBox']).toHaveBeenCalled();
    });

    it('#onMouseDown should not do anything if the mouse was already down and the click was in the preview box', () => {
        spyOn<any>(service, 'isInsideTextBox').and.returnValue(true);
        service.isWriting = true;
        service.onMouseDown(mouseEvent);

        expect(undoRedoServiceSpyObj.disableUndoRedo).not.toHaveBeenCalled();
        expect(service.registerTextCommand).not.toHaveBeenCalled();
    });

    it('#onMouseDown should register the command in undoRedo and set the app status back to the original state when clicking away', () => {
        spyOn<any>(service, 'isInsideTextBox').and.returnValue(false);
        service.isWriting = true;
        service.onMouseDown(mouseEvent);

        expect(service.registerTextCommand).toHaveBeenCalled();
        expect(undoRedoServiceSpyObj.enableUndoRedo).toHaveBeenCalled();
        expect(undoRedoServiceSpyObj.enableUndoRedo).toHaveBeenCalled();
    });

    it('#isInsideTextBox should return true when the mouse click is inside the box', () => {
        service['textSize'] = TEXT_STUB;
        service['approximateHeight'] = TEXT_STUB;
        service['initialClickPosition'] = MOUSE_POSITION;
        expect(service['isInsideTextBox'](MOUSE_POSITION)).toEqual(true);
    });

    it('#isInsideTextBox should return false when the mouse click is outside the box', () => {
        service['textSize'] = TEXT_STUB;
        service['approximateHeight'] = TEXT_STUB;
        service['initialClickPosition'] = { x: 150, y: 150 };
        expect(service['isInsideTextBox'](MOUSE_POSITION)).toEqual(false);
    });

    it('#onKeyDown should be adding the char if there if the bool isWriting is true', () => {
        spyOn<any>(service, 'addChar');
        service.isWriting = true;
        service.onKeyDown({ key: 'a' } as KeyboardEvent);
        expect(service['addChar']).toHaveBeenCalled();
    });

    it('#onKeyDown should not be adding the char if there if the bool isWriting is false', () => {
        spyOn<any>(service, 'addChar');
        service.isWriting = false;
        service.onKeyDown({ key: 'a' } as KeyboardEvent);
        expect(service['addChar']).not.toHaveBeenCalled();
    });

    it('#addChar should early return if the length of the key pressed is more then one and if it is not one of the exceptions', () => {
        service['addChar']({ key: 'CapsLock' } as KeyboardEvent);
        expect(service.registerTextCommand).not.toHaveBeenCalled();
    });

    it('#addChar should not call changeWrittenOnPreview if the key is enter, it should redraw with the enter though', () => {
        spyOn<any>(service, 'changeWrittenOnPreview');
        service['addChar']({ key: 'Enter' } as KeyboardEvent);
        expect(service.changeWrittenOnPreview).not.toHaveBeenCalled();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(service.registerTextCommand).toHaveBeenCalled();
        expect(service.drawBox).toHaveBeenCalled();
    });

    it('#addChar should add the char to the wrritten on preview string and increment the enterPos', () => {
        spyOn<any>(service, 'changeWrittenOnPreview').and.callFake(() => (service.writtenOnPreview = 'aa b c'));
        service.writtenOnPreview = 'a b c';
        service.enterPosition = [2, FOUR];
        service.writingPosition = FOUR;
        service['addChar']({ key: 'a' } as KeyboardEvent);
        expect(service.writtenOnPreview).toEqual('aa b c');
        expect(service.enterPosition).toEqual([THREE, FIVE]);
    });

    it('#changeWrittenOnPreview should be adding the char passed in parameter in the written on preview string', () => {
        service.writingPosition = FOUR;
        service.writtenOnPreview = 'a b c';
        service.changeWrittenOnPreview('a', 0, 0);
        expect(service.writtenOnPreview).toEqual('aa b c');
    });

    it('#disableWriting should reset the attributes to their initial values for another potential text zone', () => {
        service.isWriting = true;
        service.writtenOnPreview = 'a ';
        service.writingPosition = 1;
        service.enterPosition = [1];
        service['longestCharacterChain'] = { x: 1, y: 1 };

        service.disableWriting();

        expect(service.isWriting).toEqual(false);
        expect(service.writtenOnPreview).toEqual('');
        expect(service.writingPosition).toEqual(0);
        expect(service.enterPosition).toEqual([]);
        expect(service['longestCharacterChain']).toEqual({ x: 0, y: 0 });
    });

    // it('#registerTextCommand should be calling ')
});
