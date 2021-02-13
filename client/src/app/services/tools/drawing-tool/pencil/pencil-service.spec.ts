import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from './pencil-service';

// tslint:disable: no-string-literal
describe('PencilService', () => {
    let service: PencilService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    // tslint:disable-next-line: no-any
    let drawLineSpy: jasmine.Spy<any>;
    // tslint:disable-next-line: no-any
    let onMouseOutSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpyObj }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(PencilService);
        // tslint:disable-next-line: no-any
        drawLineSpy = spyOn<any>(service, 'drawLine').and.callThrough();

        // Configuration du spy du service
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service.isEraser = false;

        mouseEvent = {
            pageX: 430,
            pageY: 27,
            button: 0,
            buttons: 1,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        drawLineSpy.and.stub();
        service.onMouseUp(mouseEvent);
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawLine if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEvent);
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseMove(mouseEvent);
        expect(drawingServiceSpyObj.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    // Exemple de test d'intégration qui est quand même utile
    it('should change the pixel of the canvas ', () => {
        mouseEvent = { pageX: 405, pageY: 3, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { pageX: 406, pageY: 3, button: 0 } as MouseEvent;
        service.onMouseUp(mouseEvent);

        const expectedRedColor = 255;
        const thirdPosition = 3;
        // Premier pixel seulement
        const imageData: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageData.data[0]).toEqual(expectedRedColor); // R, the red value is 255 because the default color of the app is red.
        expect(imageData.data[1]).toEqual(0); // G
        expect(imageData.data[2]).toEqual(0); // B
        expect(imageData.data[thirdPosition]).not.toEqual(0); // A
    });

    it(' onMouseOut should call onMouseUp', () => {
        // tslint:disable-next-line: no-any
        onMouseOutSpy = spyOn<any>(service, 'onMouseOut').and.callThrough();
        service.onMouseOut(mouseEvent);
        expect(onMouseOutSpy).toHaveBeenCalled();
    });

    it(' onMouseEnter should set pencil service bool mouseDown to true if the left click is pressed when entering the canvas ', () => {
        service.onMouseEnter(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it(' onMouseEnter should set pencil service bool mouseDown to false if left click is not pressed when enterring the canvas ', () => {
        const mouseEvent2 = {
            pageX: 430,
            pageY: 27,
            button: 0,
            buttons: 0,
        } as MouseEvent;
        service.onMouseEnter(mouseEvent2);
        expect(service.mouseDown).toEqual(false);
    });

    it('should clear the canvas only if the tool is pencil service', () => {
        service.isEraser = false;
        service.clearPreviewIfNotEraser(service.isEraser);
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
    });

    it('should not clear the canvas the tool is eraser service', () => {
        service.isEraser = true;
        service.clearPreviewIfNotEraser(service.isEraser);
        expect(drawingServiceSpyObj.clearCanvas).not.toHaveBeenCalled();
    });
});
