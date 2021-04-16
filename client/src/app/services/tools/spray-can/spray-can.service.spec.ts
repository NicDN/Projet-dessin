import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { SprayCanPropreties } from '@app/classes/commands/spray-can-command/spray-can-command';
import { HORIZONTAL_OFFSET, MouseButton, VERTICAL_OFFSET } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { SprayCanService } from './spray-can.service';

// tslint:disable: no-string-literal no-any
describe('SprayCanService', () => {
    let service: SprayCanService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let colorServiceSpyObj: jasmine.SpyObj<ColorService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;

    let sprayCanPropretiesStub: SprayCanPropreties;

    const PATH_STUB: Vec2[] = [{ x: 25, y: 25 }];
    const ARRAY_STUB: number[] = [1, 2];
    const PRIMARY_COLOR_STUB = 'red';
    const OPACITY_STUB = 1;
    const MOUSE_POSITION: Vec2 = { x: 25, y: 25 };
    const LEFT_BUTTON_PRESSED = 1;
    const NO_BUTTON_PRESSED = 0;

    beforeEach(() => {
        colorServiceSpyObj = jasmine.createSpyObj('ColorService', [], {
            mainColor: { rgbValue: PRIMARY_COLOR_STUB, opacity: OPACITY_STUB },
        });

        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['']);
        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
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

        service = TestBed.inject(SprayCanService);

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            pageX: MOUSE_POSITION.x + HORIZONTAL_OFFSET,
            pageY: MOUSE_POSITION.y + VERTICAL_OFFSET,
            button: MouseButton.Left,
            buttons: LEFT_BUTTON_PRESSED,
        } as MouseEvent;

        sprayCanPropretiesStub = {
            drawingCtx: drawingServiceSpyObj.baseCtx,
            drawingPath: PATH_STUB,
            mainColor: { rgbValue: 'black', opacity: 1 },
            dropletsDiameter: 1,
            sprayDiameter: 1,
            emissionRate: 1,
            angleArray: ARRAY_STUB,
            radiusArray: ARRAY_STUB,
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#onMouseDown should call #clearInterval if right click is pressed', () => {
        const mouseEvent: MouseEvent = { button: MouseButton.Right } as MouseEvent;
        const clearInterValSpy = spyOn(global, 'clearInterval');
        service.mouseDown = false;
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toBeFalse();
        expect(clearInterValSpy).toHaveBeenCalled();
    });

    it('#onMouseDown should not call #clearInterval if right click is not pressed', () => {
        const mouseEvent: MouseEvent = { button: MouseButton.Left } as MouseEvent;
        const clearInterValSpy = spyOn(global, 'clearInterval');
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toBeTrue();
        expect(clearInterValSpy).not.toHaveBeenCalled();
    });

    it('#onMouseDown should set mouseDownCoord to correct position and call drawline', () => {
        const drawLineSpy = spyOn(service, 'drawLine').and.stub();
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
        clearInterval(service['timer']);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('#onMouseDown should set mouseDown to true on mouse down', () => {
        spyOn(service, 'drawLine').and.stub();
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
        clearInterval(service['timer']);
    });

    it('#onMouseDown should set mouseDown to false if the mouse button is not down', () => {
        const mouseEvent2 = {
            pageX: MOUSE_POSITION.x + HORIZONTAL_OFFSET,
            pageY: MOUSE_POSITION.y + VERTICAL_OFFSET,
            button: MouseButton.Back,
            buttons: NO_BUTTON_PRESSED,
        } as MouseEvent;
        service.onMouseDown(mouseEvent2);
        expect(service.mouseDown).toEqual(false);
    });

    it('#clearPath should clear pathData', () => {
        const pathDataStub: Vec2[] = [];
        service['pathData'].push({ x: 0, y: 0 });
        service['clearPath']();
        expect(service['pathData']).toEqual(pathDataStub);
    });

    it('#onMouseUp should set mouseDown to false', () => {
        service.mouseDown = true;
        service.onMouseUp();
        expect(service.mouseDown).toEqual(false);
    });

    it('#onMouseUp should call clearPath', () => {
        const clearPathSpy = spyOn<any>(service, 'clearPath').and.stub();
        service.mouseDown = true;
        service.onMouseUp();
        expect(clearPathSpy).toHaveBeenCalled();
        clearPathSpy.calls.reset();
        service.mouseDown = false;
        service.onMouseUp();
        expect(clearPathSpy).not.toHaveBeenCalled();
    });

    it('#onMouseMove should add the mousePosition to the pathData if mouseDown is true', () => {
        const expectedPathStub: Vec2[] = [{ x: 25, y: 25 }];
        service.mouseDown = true;
        service.onMouseMove(mouseEvent);
        expect(service['pathData']).toEqual(expectedPathStub);
    });

    it('#onMouseMove should not add the mousePosition to the pathData if mouseDown is true', () => {
        const expectedPathStub: Vec2[] = [];
        service.mouseDown = false;
        service.onMouseMove(mouseEvent);
        expect(service['pathData']).toEqual(expectedPathStub);
    });

    it('#onMouseEnter should call on mouseDown if left click is pressed and set mouseDownValue', () => {
        const onMouseDownSpy = spyOn(service, 'onMouseDown').and.stub();
        service.mouseDown = false;
        service.onMouseEnter(mouseEvent);
        clearInterval(service['timer']);
        expect(service.mouseDown).toEqual(true);
        expect(onMouseDownSpy).toHaveBeenCalled();
    });

    it('#onMouseEnter should not call onMouseDown if left click is not pressed', () => {
        const onMouseDownSpy = spyOn(service, 'onMouseDown').and.stub();
        const mouseEvent2 = {
            pageX: MOUSE_POSITION.x + HORIZONTAL_OFFSET,
            pageY: MOUSE_POSITION.y + VERTICAL_OFFSET,
            button: 0,
            buttons: NO_BUTTON_PRESSED,
        } as MouseEvent;
        service.onMouseEnter(mouseEvent2);
        expect(onMouseDownSpy).not.toHaveBeenCalled();
    });

    it('#setContext should set the context for the spray', () => {
        service['setContext'](baseCtxStub, { rgbValue: '#ff0000', opacity: 1 });
        expect(baseCtxStub.lineCap).toEqual('round');
        expect(baseCtxStub.lineJoin).toEqual('round');
        expect(baseCtxStub.fillStyle).toEqual('#ff0000');
    });

    it('#getRandomNumber should return a value between the min and the max', () => {
        const min = 1;
        const max = 30;
        const randomNumberStub = service['getRandomNumber'](min, max);
        expect(randomNumberStub > min && randomNumberStub < max).toBeTruthy();
    });

    it('#drawline should start the interval that calls drawSpray after a period of time', () => {
        const drawSpraySpy = spyOn<any>(service, 'drawSpray').and.stub();
        jasmine.clock().install();
        service.drawLine(baseCtxStub, service['pathData']);
        expect(drawSpraySpy).not.toHaveBeenCalled();
        jasmine.clock().tick(service['ONE_SEC_MS'] / service.emissionRate + 1);
        expect(drawSpraySpy).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });

    it('#drawSpray should call setContext to make the context ready for drawing', () => {
        const pathStub1: Vec2[] = [{ x: 25, y: 25 }];
        const setContextSpy = spyOn<any>(service, 'setContext').and.stub();
        service['drawSpray'](baseCtxStub, pathStub1);
        expect(setContextSpy).toHaveBeenCalled();
    });

    it('#sprayOnCanvas should not push to cleanPathData if is using undoRedo', () => {
        service['cleanPathData'].length = 0;
        service.sprayOnCanvas(sprayCanPropretiesStub, { x: 1, y: 1 } as Vec2, true);
        expect(service['cleanPathData'].length).toEqual(0);
    });

    it('#drawSpray should draw something on the context', () => {
        const imageDataBefore = baseCtxStub.getImageData(0, 0, 1, 1);
        const bigParameterStub = 100;
        service.dropletsDiameter = bigParameterStub;
        service.emissionRate = bigParameterStub;
        // tslint:disable-next-line: no-shadowed-variable
        const pathStub = [{ x: 0, y: 0 }];
        service['drawSpray'](baseCtxStub, pathStub);
        const imageDataAfter = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageDataAfter).not.toEqual(imageDataBefore);
    });

    it('#generateRandomArray should return an array with random value between min and max', () => {
        const min = 0;
        const max = 10;
        const arrayStub1: number[] = service['generateRandomArray'](min, max);
        for (const index of arrayStub1) {
            expect(index > min && index < max).toBeTruthy();
        }
    });

    it('#storeRandom should call generateRandomArray 2 times', () => {
        const numberOfCallsStub = 2;
        const generateRandomSpy = spyOn<any>(service, 'generateRandomArray').and.stub();
        service['storeRandom']();
        expect(generateRandomSpy).toHaveBeenCalledTimes(numberOfCallsStub);
    });

    it('#loadProprities should set the SprayCanPropreties to the current service status so it can be used in the redo', () => {
        const drawingPathStub: Vec2[] = [{ x: 1, y: 2 }];
        const sprayCanPropreties: SprayCanPropreties = service['loadProprities'](baseCtxStub, drawingPathStub);
        expect(sprayCanPropreties.drawingCtx).toEqual(baseCtxStub);
        expect(sprayCanPropreties.drawingPath).toEqual(drawingPathStub);
        expect(sprayCanPropreties.mainColor.rgbValue).toEqual(PRIMARY_COLOR_STUB);
        expect(sprayCanPropreties.dropletsDiameter * 2).toEqual(service.dropletsDiameter);
        expect(sprayCanPropreties.sprayDiameter).toEqual(service.sprayDiameter);
        expect(sprayCanPropreties.emissionRate).toEqual(service.emissionRate);
    });
});
