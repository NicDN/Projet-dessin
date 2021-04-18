import { TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { TextProperties } from '@app/classes/commands/text-command/text-command';
import { HORIZONTAL_OFFSET, VERTICAL_OFFSET } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subject } from 'rxjs';
import { FontStyle, TextPosition, TextService } from './text.service';

// tslint:disable: no-string-literal no-any max-file-line-count
describe('TextService', () => {
    let service: TextService;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;
    let colorServiceSpyObj: jasmine.SpyObj<ColorService>;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let imageDataBefore: ImageData;

    const MOUSE_POSITION: Vec2 = { x: 25, y: 25 };
    const PRIMARY_COLOR_STUB = 'black';
    const OPACITY_STUB = 1;
    const TEXT_STUB = 25;
    const FOUR = 4;
    const THREE = 3;
    const FIVE = 5;
    const FOURTY = 40;

    let textProperties: TextProperties;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', ['disableUndoRedo', 'enableUndoRedo', 'addCommand']);
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

        textProperties = {
            textContext: drawingServiceSpyObj.baseCtx,
            initialClickPosition: MOUSE_POSITION,
            writtenOnPreview: '',
            enterPosition: [],
            fontStyle: FontStyle.Arial,
            writeBold: false,
            writeItalic: false,
            textSize: TEXT_STUB,
            textPosition: TextPosition.Left,
            color: { rgbValue: colorServiceSpyObj.mainColor.rgbValue, opacity: colorServiceSpyObj.mainColor.opacity },
        };

        imageDataBefore = previewCtxStub.getImageData(0, 0, MOUSE_POSITION.x, MOUSE_POSITION.y);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#onMouseDown should be setting the service ready for writing', () => {
        spyOn<any>(service, 'disableEnableHotKeyService');
        spyOn<any>(service, 'setContextForWriting');
        spyOn<any>(service, 'displayPreviewBar');
        spyOn<any>(service, 'drawBox');
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
        spyOn<any>(service, 'registerTextCommand');
        service.isWriting = true;
        service.onMouseDown(mouseEvent);

        expect(undoRedoServiceSpyObj.disableUndoRedo).not.toHaveBeenCalled();
        expect(service.registerTextCommand).not.toHaveBeenCalled();
    });

    it('#onMouseDown should register the command in undoRedo and set the app status back to the original state when clicking away', () => {
        spyOn<any>(service, 'registerTextCommand');
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

    it('#isInsideTextBox should return true when the mouse click is inside the box', () => {
        service['textSize'] = FOURTY;
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
        spyOn<any>(service, 'registerTextCommand');
        service['addChar']({ key: 'CapsLock' } as KeyboardEvent);
        expect(service.registerTextCommand).not.toHaveBeenCalled();
    });

    it('#addChar should not call changeWrittenOnPreview if the key is enter, it should redraw with the enter though', () => {
        spyOn<any>(service, 'registerTextCommand');
        spyOn<any>(service, 'changeWrittenOnPreview');
        spyOn<any>(service, 'drawBox');
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
        service.writingPosition = THREE;
        service['addChar']({ key: 'a' } as KeyboardEvent);
        expect(service.writtenOnPreview).toEqual('aa b c');
        expect(service.enterPosition).toEqual([2, FIVE]);
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

    it('#registerTextCommand should be calling should not be adding the command to undo redo if the base context is not selected or and there is something written', () => {
        spyOn(service, 'loadTextProperties').and.returnValue(textProperties);
        spyOn(service, 'drawText');
        service.writtenOnPreview = '';
        service.registerTextCommand(previewCtxStub, service.writtenOnPreview);
        expect(undoRedoServiceSpyObj.addCommand).not.toHaveBeenCalled();
        expect(service.drawText).toHaveBeenCalled();
    });

    it('#registerTextCommand should be calling should be adding the command to undo redo if the base context is selected and there is something written', () => {
        spyOn(service, 'loadTextProperties').and.returnValue(textProperties);
        spyOn(service, 'drawText');
        service.writtenOnPreview = 'a';
        service.registerTextCommand(baseCtxStub, service.writtenOnPreview);
        expect(undoRedoServiceSpyObj.addCommand).toHaveBeenCalled();
        expect(service.drawText).toHaveBeenCalled();
    });

    it('#loadTextProperties should return a textProperties with the same value as this for all attributes', () => {
        (service['initialClickPosition'] = MOUSE_POSITION), (service.writtenOnPreview = '');
        service.enterPosition = [];
        service.fontStyle = FontStyle.Arial;
        service.writeBold = false;
        service.writeItalic = false;
        service.textSize = TEXT_STUB;
        service.textPosition = TextPosition.Left;

        expect(service.loadTextProperties(baseCtxStub, service.writtenOnPreview)).toEqual(textProperties);
    });

    it('#findLongestLineAndHeight should be setting setting only the longest line if it there is only one line', () => {
        spyOn<any>(service, 'boxSizeX');
        service.findLongestLineAndHeight(textProperties);
        expect(service['boxSizeX']).toHaveBeenCalled();
    });

    it('#findLongestLineAndHeight should be setting the y and calling boxSizeX the set the x', () => {
        spyOn<any>(service, 'boxSizeX');
        service['approximateHeight'] = TEXT_STUB;
        textProperties.writtenOnPreview = ' a';
        textProperties.enterPosition = [1];
        service.findLongestLineAndHeight(textProperties);
        expect(service['boxSizeX']).toHaveBeenCalled();
        expect(service['longestCharacterChain'].y).toEqual(TEXT_STUB);
    });

    it('#boxSizeX should set the longestCharacterChain x value', () => {
        textProperties.textContext.font = '25px Arial';
        textProperties.writtenOnPreview = 'A';
        service['boxSizeX'](textProperties, 0, textProperties.writtenOnPreview.length);
        expect(service['longestCharacterChain'].x).toEqual(textProperties.textContext.measureText('A').width);
    });

    it('#setContextForWriting should set the different context properties on the context that is used for writing', () => {
        textProperties.writeBold = true;
        textProperties.writeItalic = true;
        textProperties.textContext.font = '25px Arial';

        service['setContextForWriting'](textProperties);

        expect(textProperties.textContext.fillStyle).toEqual('#000000');
        expect(textProperties.textContext.globalAlpha).toEqual(1);
        expect(textProperties.textContext.font).toEqual('italic bold 25px Arial');
    });

    it('#setContextForWriting should set the writing type to normal if bold and italic are false', () => {
        textProperties.textContext.font = '25px Arial';
        service['setContextForWriting'](textProperties);
        expect(textProperties.textContext.font).toEqual('25px Arial');
    });

    it('#setContextForWriting should set the writing type to bold if bold is true and italic is false', () => {
        textProperties.writeBold = true;
        textProperties.textContext.font = '25px Arial';
        service['setContextForWriting'](textProperties);
        expect(textProperties.textContext.font).toEqual('bold 25px Arial');
    });

    it('#setContextForWriting should set the writing type to italic if bold is false and italic is true', () => {
        textProperties.writeItalic = true;
        textProperties.textContext.font = '25px Arial';
        service['setContextForWriting'](textProperties);
        expect(textProperties.textContext.font).toEqual('italic 25px Arial');
    });

    it('#handleEnterWhenWriting should be returning the right values', () => {
        spyOn<any>(service, 'displayPreviewBar');
        spyOn<any>(service, 'writeText');
        textProperties.writtenOnPreview = 'a b c';
        textProperties.enterPosition = [2, FOUR];
        service.writingPosition = FOUR;
        const previewStub = textProperties.writtenOnPreview.length - service.writingPosition;

        expect(service['handleEntersWhenWriting'](textProperties, previewStub)).toEqual({ x: 2, y: 4, z: true });
        expect(service['displayPreviewBar']).toHaveBeenCalled();
        expect(service['writeText']).toHaveBeenCalled();
    });

    it('currentPositionX should be returning the x position of where to draw the preview bar when allign is left', () => {
        service.textPosition = TextPosition.Left;
        service['drawingService'].previewCtx.font = '25px Arial';

        expect(service['currentPositionX']('ab', 'abc')).toEqual(
            service['drawingService'].previewCtx.measureText('ab').width + service['initialClickPosition'].x,
        );
    });

    it('currentPositionX should be returning the x position of where to draw the preview bar when allign is center', () => {
        service.textPosition = TextPosition.Center;
        service.enterPosition = [2];
        service['drawingService'].previewCtx.font = '25px Arial';
        service['initialClickPosition'] = MOUSE_POSITION;
        service['longestCharacterChain'].x = service['drawingService'].previewCtx.measureText('bc').width;

        expect(service['currentPositionX']('a', 'a')).toEqual(
            service['initialClickPosition'].x +
                service['longestCharacterChain'].x / 2 -
                service['drawingService'].previewCtx.measureText('a').width / 2 +
                service['drawingService'].previewCtx.measureText('a').width,
        );
    });

    it('currentPositionX should be returning the x position of where to draw the preview bar when allign is right', () => {
        service.textPosition = TextPosition.Right;
        service.enterPosition = [2];
        service['drawingService'].previewCtx.font = '25px Arial';
        service['initialClickPosition'] = MOUSE_POSITION;
        service['longestCharacterChain'].x = service['drawingService'].previewCtx.measureText('bc').width; // string 'a bc' -> longest row is 'bc'

        expect(service['currentPositionX']('a', 'a')).toEqual(
            service['initialClickPosition'].x +
                service['longestCharacterChain'].x -
                service['drawingService'].previewCtx.measureText('a').width +
                service['drawingService'].previewCtx.measureText('a').width,
        );
    });

    it('drawText should call the handleEnterWhenWriting function and also handle the case where the preview is in the middle of the first row with an empty enterPosition array', () => {
        spyOn<any>(service, 'handleEntersWhenWriting').and.returnValue({ x: 0, y: 0, z: false });
        spyOn<any>(service, 'displayPreviewBar');
        spyOn<any>(service, 'writeText');
        textProperties.writtenOnPreview = 'abc';
        service.writingPosition = 2;

        service.drawText(textProperties);

        expect(service['handleEntersWhenWriting']).toHaveBeenCalled();
        expect(service['displayPreviewBar']).toHaveBeenCalled();
        expect(service['writeText']).toHaveBeenCalled();
    });

    it('drawText should call the handleEnterWhenWriting function and also handle the case where the preview the writing position is at the end of the string after a few enters', () => {
        spyOn<any>(service, 'handleEntersWhenWriting').and.returnValue({ x: 0, y: 4, z: false });
        spyOn<any>(service, 'displayPreviewBar');
        spyOn<any>(service, 'writeText');
        textProperties.writtenOnPreview = 'abc ';
        textProperties.enterPosition = [FOUR];
        service.writingPosition = 2;

        service.drawText(textProperties);

        expect(service['handleEntersWhenWriting']).toHaveBeenCalled();
        expect(service['displayPreviewBar']).toHaveBeenCalled();
        expect(service['writeText']).not.toHaveBeenCalled();
    });

    it('drawText should call the handleEnterWhenWriting function and also handle the case where the preview the writing position', () => {
        spyOn<any>(service, 'handleEntersWhenWriting').and.returnValue({ x: 0, y: 4, z: true });
        spyOn<any>(service, 'displayPreviewBar');
        spyOn<any>(service, 'writeText');
        textProperties.writtenOnPreview = 'abc ';
        textProperties.enterPosition = [FOUR];
        service.writingPosition = 2;

        service.drawText(textProperties);

        expect(service['handleEntersWhenWriting']).toHaveBeenCalled();
        expect(service['displayPreviewBar']).not.toHaveBeenCalled();
        expect(service['writeText']).not.toHaveBeenCalled();
    });

    it('#drawBox should draw a box on the canvas', () => {
        service.textSize = FOURTY;
        service['approximateHeight'] = 0;
        service['initialClickPosition'] = MOUSE_POSITION;

        service.drawBox();

        const imageDataAfter = previewCtxStub.getImageData(0, 0, MOUSE_POSITION.x, MOUSE_POSITION.y);
        expect(imageDataBefore).not.toEqual(imageDataAfter);
    });

    it('#writeText should write the text on the canvas when the allign position is center', () => {
        textProperties.textContext = previewCtxStub;
        textProperties.textPosition = TextPosition.Center;
        textProperties.enterPosition = [2];
        textProperties.writtenOnPreview = 'a bc';

        service['writeText'](textProperties, 0, 1, 0);

        const imageDataAfter = previewCtxStub.getImageData(0, 0, MOUSE_POSITION.x, MOUSE_POSITION.y);
        expect(imageDataBefore).not.toEqual(imageDataAfter);
    });

    it('#writeText should write the text on the canvas when the allign position is right', () => {
        textProperties.textContext = previewCtxStub;
        textProperties.textPosition = TextPosition.Right;
        textProperties.enterPosition = [2];
        textProperties.writtenOnPreview = 'a bc';

        service['writeText'](textProperties, 0, 1, 0);

        const imageDataAfter = previewCtxStub.getImageData(0, 0, MOUSE_POSITION.x, MOUSE_POSITION.y);
        expect(imageDataBefore).not.toEqual(imageDataAfter);
    });

    it('#writeText should write the text on the canvas when the position is left', () => {
        textProperties.textContext = previewCtxStub;
        textProperties.textPosition = TextPosition.Left;
        textProperties.writtenOnPreview = 'abc';
        textProperties.initialClickPosition = { x: 1, y: 1 };

        service['writeText'](textProperties, 0, 1, 0);

        const imageDataAfter = previewCtxStub.getImageData(0, 0, MOUSE_POSITION.x, MOUSE_POSITION.y);
        expect(imageDataBefore).not.toEqual(imageDataAfter);
    });

    it('#display preview bar should not display the bar when the active textContext is the base', () => {
        imageDataBefore = baseCtxStub.getImageData(0, 0, MOUSE_POSITION.x, MOUSE_POSITION.y);

        service['displayPreviewBar'](baseCtxStub, 'a', 0, 'a');

        const imageDataAfter = baseCtxStub.getImageData(0, 0, MOUSE_POSITION.x, MOUSE_POSITION.y);
        expect(imageDataBefore).toEqual(imageDataAfter);
    });

    it('#display preview bar should change the canvas when the canvas is the preview', () => {
        service['displayPreviewBar'](previewCtxStub, 'a', 0, 'a');

        const imageDataAfter = previewCtxStub.getImageData(0, 0, MOUSE_POSITION.x, MOUSE_POSITION.y);
        expect(imageDataBefore).not.toEqual(imageDataAfter);
    });

    it('#disableEnableKeyEvents should return a observable subject', () => {
        const expectedSubject: Subject<boolean> = new Subject<boolean>();
        service['subject'] = expectedSubject;
        expect(service.disableEnableKeyEvents()).toEqual(expectedSubject.asObservable());
    });
});
