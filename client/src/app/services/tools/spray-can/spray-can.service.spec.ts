import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { HORIZONTAL_OFFSET, MouseButton, VERTICAL_OFFSET } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SprayCanService } from './spray-can.service';

// tslint:disable: no-string-literal
describe('SprayCanService', () => {
    let service: SprayCanService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let colorServiceSpyObj: jasmine.SpyObj<ColorService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    const PRIMARY_COLOR_STUB = 'red';
    const OPACITY_STUB = 1;
    const MOUSE_POSITION: Vec2 = { x: 25, y: 25 };
    const LEFT_BUTTON_PRESSED = 1;
    const NO_BUTTON_PRESSED = 0;

    beforeEach(() => {
        colorServiceSpyObj = jasmine.createSpyObj('ColorService', [], {
            mainColor: { rgbValue: PRIMARY_COLOR_STUB, opacity: OPACITY_STUB },
        });

        // add the functions I need from drawingService here
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: ColorService, useValue: colorServiceSpyObj },
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
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
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
        service.onMouseUp(mouseEvent);
        expect(service.mouseDown).toEqual(false);
    });

    it('#onMouseUp should call clearPath', () => {
        // tslint:disable-next-line: no-any
        const clearPathSpy = spyOn<any>(service, 'clearPath').and.stub();
        service.mouseDown = true;
        service.onMouseUp(mouseEvent);
        expect(clearPathSpy).toHaveBeenCalled();
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

    it('#onMouseOut should call onMouseUp', () => {
        const onMouseUpSpy = spyOn(service, 'onMouseUp').and.stub();
        service.onMouseOut(mouseEvent);
        expect(onMouseUpSpy).toHaveBeenCalled();
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
        service.setContext(baseCtxStub);
        expect(baseCtxStub.lineCap).toEqual('round');
        expect(baseCtxStub.lineJoin).toEqual('round');
        expect(baseCtxStub.fillStyle).toEqual('#ff0000');
    });

    it('#getRandomNumber should return a value between the min and the max', () => {
        const min = 1;
        const max = 30;
        const randomNumberStub = service.getRandomNumber(min, max);
        expect(randomNumberStub > min && randomNumberStub < max).toBeTruthy();
    });

    it('#drawline should start the interval that calls drawSpray after a period of time', () => {
        const drawSpraySpy = spyOn(service, 'drawSpray').and.stub();
        jasmine.clock().install();
        service.drawLine(baseCtxStub, service['pathData']);
        expect(drawSpraySpy).not.toHaveBeenCalled();
        jasmine.clock().tick(service.ONESECMS / service.emissionRate + 1);
        expect(drawSpraySpy).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });

    it('#drawSpray should call setContext to make the context ready for drawing', () => {
        const pathStub: Vec2[] = [{ x: 25, y: 25 }];
        const setContextSpy = spyOn(service, 'setContext').and.stub();
        service.drawSpray(baseCtxStub, pathStub);
        expect(setContextSpy).toHaveBeenCalled();
    });

    it('#drawSpray should draw something on the context', () => {
        const imageDataBefore = baseCtxStub.getImageData(0, 0, 1, 1);
        const bigParameterStub = 100;
        service.dropletsDiameter = bigParameterStub;
        service.emissionRate = bigParameterStub;
        const pathStub = [{ x: 0, y: 0 }];
        service.drawSpray(baseCtxStub, pathStub);
        const imageDataAfter = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageDataAfter).not.toEqual(imageDataBefore);
    });
});
