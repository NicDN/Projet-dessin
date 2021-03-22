import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { HORIZONTAL_OFFSET, MouseButton, VERTICAL_OFFSET } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EyeDropperService } from './eye-dropper.service';

// tslint:disable: no-string-literal no-any
describe('EyeDropperService', () => {
    let service: EyeDropperService;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let mouseEvent: MouseEvent;

    const MOUSE_POSITION: Vec2 = { x: 25, y: 25 };
    const LEFT_BUTTON_PRESSED = 1;
    const MOUSEVALUE = 25;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpyObj }],
        });
        service = TestBed.inject(EyeDropperService);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service['drawingService'].baseCtx = baseCtxStub;

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

    it('#onMouseDown should set the value of leftclick to true if there was a mousedown', () => {
        const getImageDataSpy = spyOn<any>(service, 'getImageData').and.stub();
        service.leftClick = false;
        service.onMouseDown(mouseEvent);
        expect(service.leftClick).toEqual(true);
        expect(getImageDataSpy).toHaveBeenCalled();
    });

    it('#onMouseMove should call getImageData to get the data for the preview and send it to the attribute', () => {
        service['drawingService'].baseCtx.fillRect(1, 1, 1, 1);
        const previewSizeStub = 11;
        const mousePosition = 25;
        const extractedPositionStub = mousePosition - previewSizeStub / 2;
        const gridOfPixelStub: ImageData = service['drawingService'].baseCtx.getImageData(
            extractedPositionStub,
            extractedPositionStub,
            previewSizeStub,
            previewSizeStub,
        );
        service.onMouseMove(mouseEvent);
        expect(service.currentGridOfPixelData).toEqual(gridOfPixelStub);
    });

    it('#onMouseEnter should set the value of preview to true', () => {
        service.preview = false;
        service.onMouseEnter(mouseEvent);
        expect(service.preview).toEqual(true);
    });

    it('#onMouseOut should set the value of preview to false', () => {
        service.preview = true;
        service.onMouseOut(mouseEvent);
        expect(service.preview).toEqual(false);
    });

    it('#getImageDate should get the pixel data under the current mouse position and send it to currentPixelData and call sendNotifColor', () => {
        const sendNotifColorSpy = spyOn<any>(service, 'sendNotifColor').and.callThrough();
        service['drawingService'].baseCtx.fillRect(MOUSEVALUE, MOUSEVALUE, 1, 1);
        const currentPixelDataStub = service['drawingService'].baseCtx.getImageData(MOUSEVALUE, MOUSEVALUE, 1, 1);
        service['getImageData']({ x: MOUSEVALUE, y: MOUSEVALUE });
        expect(service.currentPixelData).toEqual(currentPixelDataStub);
        expect(sendNotifColorSpy).toHaveBeenCalled();
    });
});
