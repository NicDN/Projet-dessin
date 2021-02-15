import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleDrawingService } from './rectangle-drawing.service';

// tslint:disable: no-string-literal
describe('RectangleDrawingService', () => {
    let service: RectangleDrawingService;
    let colorServiceSpyObj: jasmine.SpyObj<ColorService>;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    const PRIMARY_COLOR_STUB = 'blue';
    const SECONDARY_COLOR_STUB = 'black';
    const OPACITY_STUB = 1;
    const THICKNESS_STUB = 4;
    let TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    let BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 20 };
    let SIDE_LENGTHS_STUB: Vec2;

    const RGB_MAX = 255;

    beforeEach(() => {
        colorServiceSpyObj = jasmine.createSpyObj('ColorService', [], {
            mainColor: { rgbValue: PRIMARY_COLOR_STUB, opacity: OPACITY_STUB },
            secondaryColor: { rgbValue: SECONDARY_COLOR_STUB, opacity: OPACITY_STUB },
        });
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [
                RectangleDrawingService,
                { provide: ColorService, useValue: colorServiceSpyObj },
                { provide: DrawingService, useValue: drawingServiceSpyObj },
            ],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(RectangleDrawingService);

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        TOP_LEFT_CORNER_COORDS = { x: 0, y: 0 };
        BOTTOM_RIGHT_CORNER_COORDS = { x: 40, y: 20 };
        SIDE_LENGTHS_STUB = {
            x: BOTTOM_RIGHT_CORNER_COORDS.x - TOP_LEFT_CORNER_COORDS.x,
            y: BOTTOM_RIGHT_CORNER_COORDS.y - TOP_LEFT_CORNER_COORDS.y,
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#setContextParameters should change the right ctx parameters', () => {
        service.setContextParameters(drawingServiceSpyObj.baseCtx, THICKNESS_STUB);
        expect(drawingServiceSpyObj.baseCtx.getLineDash()).toEqual([]);
        expect(drawingServiceSpyObj.baseCtx.lineWidth).toEqual(THICKNESS_STUB);
        expect(drawingServiceSpyObj.baseCtx.lineJoin).toEqual('miter');
    });

    it('#draw should draw a rectangle on the canvas at the right position and using the right colours', () => {
        service.thickness = THICKNESS_STUB;
        service.traceType = TraceType.FilledAndBordered;
        service.draw(drawingServiceSpyObj.baseCtx, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);

        const borderPoint: Vec2 = { x: 2, y: 10 };
        const centerPoint: Vec2 = { x: 20, y: 10 };
        const outsidePoint: Vec2 = { x: 41, y: 0 };

        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, RGB_MAX));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, RGB_MAX, RGB_MAX));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#draw without border should draw a rectangle on the canvas at the right position and using the right colours', () => {
        service.thickness = THICKNESS_STUB;
        service.traceType = TraceType.FilledNoBordered;
        service.draw(drawingServiceSpyObj.baseCtx, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);

        const borderPoint: Vec2 = { x: 2, y: 10 };
        const centerPoint: Vec2 = { x: 20, y: 10 };
        const outsidePoint: Vec2 = { x: 41, y: 10 };

        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, RGB_MAX, RGB_MAX));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, RGB_MAX, RGB_MAX));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#draw when using alternate shape should draw a square on the canvas at the right position and using the right colours', () => {
        service.thickness = THICKNESS_STUB;
        service.traceType = TraceType.Bordered;
        service['alternateShape'] = true;
        service.draw(drawingServiceSpyObj.baseCtx, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);

        const borderPoint: Vec2 = { x: 10, y: 2 };
        const centerPoint: Vec2 = { x: 12, y: 10 };
        const outsidePoint: Vec2 = { x: 22, y: 10 };

        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, RGB_MAX));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#adjustToBorder should adjust the begin coords and length appropriately', () => {
        const initialWidth = 50;
        const initialCoords = { x: TOP_LEFT_CORNER_COORDS.x, y: TOP_LEFT_CORNER_COORDS.y };
        const initialLengths = { x: SIDE_LENGTHS_STUB.x, y: SIDE_LENGTHS_STUB.y };
        drawingServiceSpyObj.previewCtx.lineWidth = initialWidth;

        service.adjustToBorder(drawingServiceSpyObj.previewCtx, SIDE_LENGTHS_STUB, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);
        expect(drawingServiceSpyObj.baseCtx.lineWidth).toBeLessThan(initialWidth);
        expect(TOP_LEFT_CORNER_COORDS.x).toBeGreaterThan(initialCoords.x);
        expect(TOP_LEFT_CORNER_COORDS.y).toBeGreaterThan(initialCoords.y);
        expect(SIDE_LENGTHS_STUB.x).toBeLessThan(initialLengths.x);
        expect(SIDE_LENGTHS_STUB.y).toBeLessThan(initialLengths.y);
    });

    it('#adjustToWidth should adjust properly if end coords and begin coords are same (edge case)', () => {
        const initialWidth = 50;
        const initialCoords = { x: TOP_LEFT_CORNER_COORDS.x, y: TOP_LEFT_CORNER_COORDS.y };
        const initialLengths = { x: 0, y: 0 };
        drawingServiceSpyObj.previewCtx.lineWidth = initialWidth;

        service.adjustToBorder(drawingServiceSpyObj.previewCtx, initialLengths, TOP_LEFT_CORNER_COORDS, TOP_LEFT_CORNER_COORDS);
        expect(drawingServiceSpyObj.baseCtx.lineWidth).toEqual(1);
        expect(TOP_LEFT_CORNER_COORDS).toEqual(initialCoords);
    });
});
