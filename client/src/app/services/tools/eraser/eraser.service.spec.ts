import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { HORIZONTAL_OFFSET, MouseButton, VERTICAL_OFFSET } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EraserService } from './eraser.service';

describe('EraserService', () => {
    let service: EraserService;
    let canvasTestHelper: CanvasTestHelper;
    let canvasStub: HTMLCanvasElement;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let mouseEvent: MouseEvent;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let drawLineSpy: jasmine.Spy;
    let singleClickSpy: jasmine.Spy;
    let imageDataBefore: ImageData;
    let imageDataAfter: ImageData;

    const point1: Vec2 = { x: 0, y: 0 };
    const point2: Vec2 = { x: 3, y: 4 };
    const mouseEventStart = { pageX: 405, pageY: 3, button: 0 } as MouseEvent;
    const mouseEventEnd = { pageX: 406, pageY: 3, button: 0 } as MouseEvent;
    const MOUSE_POSITION: Vec2 = { x: 25, y: 25 };
    const LEFT_BUTTON_PRESSED = 1;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpyObj }],
        });
        service = TestBed.inject(EraserService);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        drawLineSpy = spyOn(service, 'drawLine').and.callThrough();
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

        singleClickSpy = spyOn(service, 'singleClick').and.callThrough();

        // If decide to raw in white instead , decomment this.
        baseCtxStub.fillStyle = 'white'; //
        baseCtxStub.rect(0, 0, 1, 1); //
        baseCtxStub.fill(); //
        imageDataBefore = baseCtxStub.getImageData(0, 0, 1, 1);

        baseCtxStub.fillStyle = 'black'; //
        baseCtxStub.rect(0, 0, 1, 1);
        baseCtxStub.fill();
        imageDataAfter = baseCtxStub.getImageData(0, 0, 1, 1);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#distanceBetween should return the distance between 2 points', () => {
        const expectedValue = 5;
        expect(service.distanceBetween(point1, point2)).toEqual(expectedValue);
    });

    it('#angleBetween should return the angle between 2 points', () => {
        const expectedValue = 0.6435011087932844;
        expect(service.angleBetween(point1, point2)).toEqual(expectedValue);
    });

    it('#singleClick should return if there is a single click', () => {
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

    it('#onMoveMove should call the mouseMove from pencilService and display the preview', () => {
        const everyMouseMoveSpy: jasmine.Spy = spyOn(service, 'everyMouseMove').and.callThrough();
        const displayPreviewSpy: jasmine.Spy = spyOn(service, 'displayPreview').and.callThrough();
        service.onMouseMove(mouseEvent);
        expect(everyMouseMoveSpy).toHaveBeenCalled();
        expect(displayPreviewSpy).toHaveBeenCalled();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
    });

    it('#eraseSquare should erase part off the context', () => {
        expect(imageDataBefore).not.toEqual(imageDataAfter);

        service.eraseSquare(baseCtxStub, { x: 0, y: 0 });
        const imageDataErased: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageDataBefore).toEqual(imageDataErased);
    });

    it('#setAttributesDisplay should set the context to the right attributes', () => {
        service.setAttributesDisplay(baseCtxStub);
        expect(baseCtxStub.fillStyle).toEqual('#ffffff');
        expect(baseCtxStub.strokeStyle).toEqual('#000000');
        expect(baseCtxStub.lineWidth).toEqual(1);
        expect(baseCtxStub.globalAlpha).toEqual(1);
    });

    it('#drawLine should erase on the canvas if there is a single click', () => {
        expect(imageDataBefore).not.toEqual(imageDataAfter);

        service.onMouseDown(mouseEventStart);
        service.onMouseUp(mouseEventEnd);

        const imageData: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageData).toEqual(imageDataBefore);
    });

    it('#drawline should erase on mouse move', () => {
        expect(imageDataBefore).not.toEqual(imageDataAfter);

        const singleClickStub = false;
        singleClickSpy.and.returnValue(singleClickStub);

        service.onMouseDown(mouseEventStart);
        service.onMouseMove(mouseEventEnd);

        const imageData: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageData).toEqual(imageDataBefore);
        expect(drawLineSpy).toHaveBeenCalled();
    });
});
