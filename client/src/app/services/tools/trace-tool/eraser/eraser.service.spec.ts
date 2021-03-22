import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { TraceToolPropreties } from '@app/classes/commands/trace-tool-command/trace-tool-command';
import { HORIZONTAL_OFFSET, MouseButton, VERTICAL_OFFSET } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { EraserService } from './eraser.service';

// tslint:disable: no-string-literal
// tslint:disable: no-any
describe('EraserService', () => {
    let service: EraserService;
    let canvasTestHelper: CanvasTestHelper;
    let canvasStub: HTMLCanvasElement;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let mouseEvent: MouseEvent;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let singleClickSpy: jasmine.Spy;
    let imageDataBefore: ImageData;
    let imageDataAfter: ImageData;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;

    const point1: Vec2 = { x: 0, y: 0 };
    const point2: Vec2 = { x: 3, y: 4 };
    const MOUSE_POSITION: Vec2 = { x: 25, y: 25 };
    const LEFT_BUTTON_PRESSED = 1;

    canvasStub = document.createElement('canvas');
    let canvasCtxStub: CanvasRenderingContext2D;
    canvasCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;
    const pathStub: Vec2 = { x: 1, y: 1 };
    const pathArrayStub: Vec2[] = [pathStub, pathStub];
    const colorStub: Color = { rgbValue: 'white', opacity: 1 };

    let drawingToolPropretiesStub: TraceToolPropreties;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', ['addCommand']);

        drawingToolPropretiesStub = {
            drawingContext: canvasCtxStub,
            drawingPath: pathArrayStub,
            drawingThickness: 4,
            drawingColor: colorStub,
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: UndoRedoService, useValue: undoRedoServiceSpyObj },
            ],
        });
        service = TestBed.inject(EraserService);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        canvasStub = canvasTestHelper.canvas;
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        const drawingServiceString = 'drawingService';
        service[drawingServiceString].canvas = canvasStub;
        service[drawingServiceString].baseCtx = baseCtxStub;
        service[drawingServiceString].previewCtx = previewCtxStub;

        mouseEvent = {
            pageX: MOUSE_POSITION.x + HORIZONTAL_OFFSET,
            pageY: MOUSE_POSITION.y + VERTICAL_OFFSET,
            button: MouseButton.Left,
            buttons: LEFT_BUTTON_PRESSED,
        } as MouseEvent;

        singleClickSpy = spyOn<any>(service, 'singleClick').and.callThrough();

        baseCtxStub.fillStyle = 'white';
        baseCtxStub.rect(0, 0, 1, 1);
        baseCtxStub.fill();
        imageDataBefore = baseCtxStub.getImageData(0, 0, 1, 1);

        baseCtxStub.fillStyle = 'black';
        baseCtxStub.rect(0, 0, 1, 1);
        baseCtxStub.fill();
        imageDataAfter = baseCtxStub.getImageData(0, 0, 1, 1);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#distanceBetween should return the distance between 2 points', () => {
        const expectedValue = 5;
        expect(service['distanceBetween'](point1, point2)).toEqual(expectedValue);
    });

    it('#angleBetween should return the angle between 2 points', () => {
        const expectedValue = 0.6435011087932844;
        expect(service['angleBetween'](point1, point2)).toEqual(expectedValue);
    });

    it('#singleClick should return if there is a single click', () => {
        const path1 = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        expect(service['singleClick'](path1)).toEqual(true);

        const path2 = [
            { x: 0, y: 0 },
            { x: 2, y: 0 },
            { x: 1, y: 1 },
        ];
        expect(service['singleClick'](path2)).toEqual(false);
    });

    it('#onMoveMove should call the mouseMove from pencilService and display the preview', () => {
        const everyMouseMoveSpy: jasmine.Spy = spyOn<any>(service, 'everyMouseMove').and.callThrough();
        const displayPreviewSpy: jasmine.Spy = spyOn<any>(service, 'displayPreview').and.callThrough();
        service.onMouseMove(mouseEvent);
        expect(everyMouseMoveSpy).toHaveBeenCalled();
        expect(displayPreviewSpy).toHaveBeenCalled();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
    });

    it('#eraseSquare should erase part off the context', () => {
        expect(imageDataBefore).not.toEqual(imageDataAfter);

        service['eraseSquare'](baseCtxStub, { x: 0, y: 0 }, 1);
        const imageDataErased: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageDataBefore).toEqual(imageDataErased);
    });

    it('#setAttributesDisplay should set the context to the right attributes', () => {
        service['setAttributesDisplay'](baseCtxStub);
        expect(baseCtxStub.fillStyle).toEqual('#ffffff');
        expect(baseCtxStub.strokeStyle).toEqual('#000000');
        expect(baseCtxStub.lineWidth).toEqual(1);
        expect(baseCtxStub.globalAlpha).toEqual(1);
    });

    it('#drawTrace should erase on the canvas if there is a single click', () => {
        expect(imageDataBefore).not.toEqual(imageDataAfter);
        const alphaValue = 3;
        service.drawTrace(drawingToolPropretiesStub);
        const imageData: ImageData = drawingToolPropretiesStub.drawingContext.getImageData(0, 0, 1, 1);
        imageData.data[alphaValue] = imageData.data[alphaValue] + 1;
        expect(imageData).toEqual(imageDataBefore);
    });

    it('#drawTrace should erase on mouse move', () => {
        expect(imageDataBefore).not.toEqual(imageDataAfter);

        const singleClickStub = false;
        singleClickSpy.and.returnValue(singleClickStub);
        const path2 = [
            { x: 0, y: 0 },
            { x: 2, y: 0 },
            { x: 1, y: 1 },
        ];
        drawingToolPropretiesStub.drawingPath = path2;
        service.drawTrace(drawingToolPropretiesStub);
        const imageData: ImageData = drawingToolPropretiesStub.drawingContext.getImageData(0, 0, 1, 1);
        expect(imageData).toEqual(imageDataBefore);
    });

    it('#drawLine should load propreties', () => {
        const loadUpSpy = spyOn<any>(service, 'loadUpEraserPropreties').and.returnValue(drawingToolPropretiesStub);
        drawingToolPropretiesStub.drawingPath = pathArrayStub;
        service.drawLine(drawingToolPropretiesStub.drawingContext, drawingToolPropretiesStub.drawingPath);

        expect(loadUpSpy).toHaveBeenCalled();
    });

    it('#sendCommandAction should call execute of eraser and add the command to the stack of undo-redo', () => {
        const eraserSpy = spyOn(service, 'drawTrace');
        service.sendCommandAction();
        expect(undoRedoServiceSpyObj.addCommand).toHaveBeenCalled();
        expect(eraserSpy).toHaveBeenCalled();
    });

    it('#loadUpEraserPropreties should return the correct propreties', () => {
        const drawingToolPropreties: TraceToolPropreties = service['loadUpEraserPropreties'](baseCtxStub, pathArrayStub);
        expect(drawingToolPropreties.drawingContext).toEqual(baseCtxStub);
        expect(drawingToolPropreties.drawingPath).toEqual(pathArrayStub);
        expect(drawingToolPropreties.drawingThickness).toEqual(service.thickness);
    });
});
