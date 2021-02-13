import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EraserService } from './eraser.service';

fdescribe('EraserService', () => {
    let service: EraserService;
    let canvasTestHelper: CanvasTestHelper;
    let canvasStub: HTMLCanvasElement;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let mouseEvent: MouseEvent;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    // tslint:disable-next-line: no-any
    let drawLineSpy: jasmine.Spy<any>;
    // tslint:disable-next-line: no-any
    let singleClickSpy: jasmine.Spy<any>;

    const point1: Vec2 = { x: 0, y: 0 };
    const point2: Vec2 = { x: 3, y: 4 };

    // let drawingServiceSpyValidateInput: jasmine.Spy<any>;
    // drawingServiceSpyValidateInput = spyOn<any>(service, 'validateUserInput').and.callThrough();
    // drawingServiceSpyValidateInput.and.returnValue(validateStub);
    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpyObj }],
        });
        service = TestBed.inject(EraserService);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        // tslint:disable-next-line: no-any
        drawLineSpy = spyOn<any>(service, 'drawLine').and.callThrough();
        canvasStub = canvasTestHelper.canvas;
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        const drawingServiceString = 'drawingService';
        service[drawingServiceString].canvas = canvasStub;
        service[drawingServiceString].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service[drawingServiceString].previewCtx = previewCtxStub;

        mouseEvent = {
            pageX: 430,
            pageY: 27,
            button: 0,
            buttons: 1,
        } as MouseEvent;

        singleClickSpy = spyOn<any>(service, 'singleClick').and.callThrough();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('distanceBetween should return the distance between 2 points', () => {
        const expectedValue = 5;
        expect(service.distanceBetween(point1, point2)).toEqual(expectedValue);
    });

    it('angleBetween should return the angle between 2 points', () => {
        const expectedValue = 0.6435011087932844;
        expect(service.angleBetween(point1, point2)).toEqual(expectedValue);
    });

    it('verifThickness should set and check the eraser writing thickness on the canvas', () => {
        const thicknessStubValue = 10;
        service.verifThickness(baseCtxStub, thicknessStubValue);
        expect(baseCtxStub.lineWidth).toEqual(thicknessStubValue);

        const underMinThickness = 2;
        service.verifThickness(baseCtxStub, underMinThickness);
        expect(baseCtxStub.lineWidth).toEqual(service.MINTHICKNESS);
    });

    it('singleClick should return if there is a single click', () => {
        const path1 = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        expect(service.singleClick(path1)).toEqual(true);

        const path2 = [
            { x: 0, y: 0 },
            { x: 2, y: 0 },
            { x: 1, y: 1 },
        ];
        expect(service.singleClick(path2)).toEqual(false);
    });

    it('onMoveMove should call the mouseMove from pencilService and display the preview', () => {
        // tslint:disable-next-line: no-any
        const everyMouseMoveSpy: jasmine.Spy<any> = spyOn<any>(service, 'everyMouseMove').and.callThrough();
        // tslint:disable-next-line: no-any
        const displayPreviewSpy: jasmine.Spy<any> = spyOn<any>(service, 'displayPreview').and.callThrough();
        service.onMouseMove(mouseEvent);
        expect(everyMouseMoveSpy).toHaveBeenCalled();
        expect(displayPreviewSpy).toHaveBeenCalled();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
    });

    it('EraseSquare should erase part off the context', () => {
        const imageDataBefore: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        baseCtxStub.rect(0, 0, 1, 1);
        baseCtxStub.fill();
        const imageDataAfter: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageDataBefore).not.toEqual(imageDataAfter);

        service.eraseSquare(baseCtxStub, { x: 0, y: 0 });
        const imageDataErased: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageDataBefore).toEqual(imageDataErased);
    });

    it('setAttributesDisplay should set the context to the right attributes', () => {
        service.setAttributesDisplay(baseCtxStub);
        expect(baseCtxStub.fillStyle).toEqual('#ffffff');
        expect(baseCtxStub.strokeStyle).toEqual('#000000');
        expect(baseCtxStub.lineWidth).toEqual(1);
        expect(baseCtxStub.globalAlpha).toEqual(1);
    });

    it('drawLine should erase on the canvas if there is a single click', () => {
        const imageDataBefore: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        baseCtxStub.rect(0, 0, 1, 1);
        baseCtxStub.fill();
        const imageDataAfter: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageDataBefore).not.toEqual(imageDataAfter);

        const singleClickStub = true;
        singleClickSpy.and.returnValue(singleClickStub);

        mouseEvent = { pageX: 405, pageY: 3, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { pageX: 406, pageY: 3, button: 0 } as MouseEvent;
        service.onMouseUp(mouseEvent);

        const imageData: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageData).toEqual(imageDataBefore);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('drawline should erase on mouse move', () => {
        const imageDataBefore: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        baseCtxStub.rect(0, 0, 1, 1);
        baseCtxStub.fill();
        const imageDataAfter: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageDataBefore).not.toEqual(imageDataAfter);

        const singleClickStub = false;
        singleClickSpy.and.returnValue(singleClickStub);

        mouseEvent = { pageX: 405, pageY: 3, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { pageX: 406, pageY: 3, button: 0 } as MouseEvent;
        service.onMouseMove(mouseEvent);

        const imageData: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageData).toEqual(imageDataBefore);
        expect(drawLineSpy).toHaveBeenCalled();
    });
});
