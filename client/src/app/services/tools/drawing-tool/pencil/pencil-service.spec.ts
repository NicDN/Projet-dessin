import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { TraceToolPropreties, TraceToolType } from '@app/classes/commands/drawing-tool-command/drawing-tool-command';
import { HORIZONTAL_OFFSET, MouseButton, VERTICAL_OFFSET } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { PencilService } from './pencil.service';

// tslint:disable: no-string-literal
describe('PencilService', () => {
    let service: PencilService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let colorServiceSpyObj: jasmine.SpyObj<ColorService>;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawLineSpy: jasmine.Spy;

    const canvasStub: HTMLCanvasElement = document.createElement('canvas');
    let canvasCtxStub: CanvasRenderingContext2D;
    canvasCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;

    const pathStub: Vec2 = { x: 1, y: 1 };
    const pathArrayStub: Vec2[] = [pathStub, pathStub];
    const colorStub: Color = { rgbValue: 'red', opacity: 1 };

    const drawingToolPropretiesStub: TraceToolPropreties = {
        traceToolType: TraceToolType.Pencil,
        drawingContext: canvasCtxStub,
        drawingPath: pathArrayStub,
        drawingThickness: 1,
        drawingColor: colorStub,
        drawWithJunction: true,
        junctionDiameter: 1,
    };

    const PRIMARY_COLOR_STUB = 'red';
    const OPACITY_STUB = 1;
    const MOUSE_POSITION: Vec2 = { x: 25, y: 25 };
    const LEFT_BUTTON_PRESSED = 1;
    const NO_BUTTON_PRESSED = 0;

    beforeEach(() => {
        colorServiceSpyObj = jasmine.createSpyObj('ColorService', [], {
            mainColor: { rgbValue: PRIMARY_COLOR_STUB, opacity: OPACITY_STUB },
        });

        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', ['addCommand', 'sendCommandAction']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: ColorService, useValue: colorServiceSpyObj },
                { provide: UndoRedoService, useValue: undoRedoServiceSpyObj },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(PencilService);
        drawLineSpy = spyOn(service, 'drawLine').and.callThrough();

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service.isEraser = false;

        mouseEvent = {
            pageX: MOUSE_POSITION.x + HORIZONTAL_OFFSET,
            pageY: MOUSE_POSITION.y + VERTICAL_OFFSET,
            button: MouseButton.Left,
            buttons: LEFT_BUTTON_PRESSED,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it('#mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it('#mouseDown should set mouseDown property to false on middle click', () => {
        const mouseEventRClick = {
            offsetX: MOUSE_POSITION.x,
            offsetY: MOUSE_POSITION.y,
            button: 1,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it('#onMouseUp should send action to the undoRedoService', () => {
        spyOn(service, 'sendCommandAction');
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        drawLineSpy.and.stub();
        service.onMouseUp(mouseEvent);
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(service.sendCommandAction).toHaveBeenCalled();
    });

    it('#onMouseUp should not call drawLine if mouse was not already down', () => {
        spyOn(service, 'sendCommandAction');
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEvent);
        expect(service.sendCommandAction).not.toHaveBeenCalled();
    });

    it('#onMouseMove should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEvent);
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('#onMouseMove should not call drawLine if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseMove(mouseEvent);
        expect(drawingServiceSpyObj.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('#executeDrawLine should change the pixel of the canvas ', () => {
        const expectedRedColor = 255;
        const thirdPosition = 3;

        const imageData: ImageData = drawingToolPropretiesStub.drawingContext.getImageData(0, 0, 1, 1);

        expect(imageData.data[0]).toEqual(expectedRedColor); // R, the red value is 255 because the default color of the app is red.
        expect(imageData.data[1]).toEqual(0); // G
        expect(imageData.data[2]).toEqual(0); // B
        expect(imageData.data[thirdPosition]).not.toEqual(0); // A
    });

    it('#drawLine should load propreties', () => {
        const loadUpSpy = spyOn(service, 'loadUpPropreties').and.returnValue(drawingToolPropretiesStub);
        drawingToolPropretiesStub.drawingPath = pathArrayStub;
        service.drawLine(baseCtxStub, drawingToolPropretiesStub.drawingPath);

        expect(loadUpSpy).toHaveBeenCalled();
    });

    it('#onMouseEnter should set pencil service bool mouseDown to true if the left click is pressed when entering the canvas ', () => {
        service.onMouseEnter(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it('#onMouseEnter should set pencil service bool mouseDown to false if left click is not pressed when enterring the canvas ', () => {
        const mouseEvent2 = {
            pageX: MOUSE_POSITION.x + HORIZONTAL_OFFSET,
            pageY: MOUSE_POSITION.y + VERTICAL_OFFSET,
            button: 0,
            buttons: NO_BUTTON_PRESSED,
        } as MouseEvent;
        service.onMouseEnter(mouseEvent2);
        expect(service.mouseDown).toEqual(false);
    });

    it('#should clear the canvas only if the tool is pencil service', () => {
        service.isEraser = false;
        service.clearPreviewIfNotEraser(service.isEraser);
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
    });

    it('#should not clear the canvas the tool is eraser service', () => {
        service.isEraser = true;
        service.clearPreviewIfNotEraser(service.isEraser);
        expect(drawingServiceSpyObj.clearCanvas).not.toHaveBeenCalled();
    });

    it('#setContext should set the context for drawing', () => {
        service['setContext'](drawingToolPropretiesStub.drawingContext, drawingToolPropretiesStub);
        expect(drawingToolPropretiesStub.drawingContext.lineCap).toEqual('round');
        expect(drawingToolPropretiesStub.drawingContext.lineJoin).toEqual('round');
        expect(drawingToolPropretiesStub.drawingContext.lineWidth).toEqual(service.thickness);
        expect(drawingToolPropretiesStub.drawingContext.globalAlpha).toEqual(colorServiceSpyObj.mainColor.opacity);
        expect(drawingToolPropretiesStub.drawingContext.strokeStyle).toEqual('#ff0000');
    });

    it('#sendCommandAction should call execute of pencil and add the command to the stack of undo-redo', () => {
        const pencilSpy = spyOn(service, 'drawTrace');
        service.sendCommandAction();
        expect(undoRedoServiceSpyObj.addCommand).toHaveBeenCalled();
        expect(pencilSpy).toHaveBeenCalled();
    });

    it('#sendCommandAction should return if we are erasing', () => {
        service.isEraser = true;
        service.sendCommandAction();
        expect(undoRedoServiceSpyObj.addCommand).not.toHaveBeenCalled();
    });

    it('#setContext should return if drawing color is undefined', () => {
        drawingToolPropretiesStub.drawingColor = undefined;
        service['setContext'](baseCtxStub, drawingToolPropretiesStub);
        expect(baseCtxStub.lineJoin).not.toEqual('round');
    });
});
