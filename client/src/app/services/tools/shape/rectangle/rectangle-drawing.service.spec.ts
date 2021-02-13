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
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    const primaryColor = 'blue';
    const secondaryColor = 'black';
    const defaultOpacity = 1;
    const defaultThickness = 4;
    let topLeftCorner: Vec2 = { x: 0, y: 0 };
    let bottomRightCorner: Vec2 = { x: 40, y: 20 };
    let lengths: Vec2 = { x: bottomRightCorner.x - topLeftCorner.x, y: bottomRightCorner.y - topLeftCorner.y };
    // const bottomLeftCorner: Vec2 = { x: 0, y: 20 };
    // const topRightCorner: Vec2 = { x: 40, y: 0 };

    beforeEach(() => {
        const colorSpy = jasmine.createSpyObj('ColorService', [], {
            mainColor: { rgbValue: primaryColor, opacity: defaultOpacity },
            secondaryColor: { rgbValue: secondaryColor, opacity: defaultOpacity },
        });
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [
                RectangleDrawingService,
                { provide: ColorService, useValue: colorSpy },
                { provide: DrawingService, useValue: drawServiceSpy },
            ],
        });
        service = TestBed.inject(RectangleDrawingService);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(RectangleDrawingService);
        colorServiceSpy = TestBed.inject(ColorService) as jasmine.SpyObj<ColorService>;

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        topLeftCorner = { x: 0, y: 0 };
        bottomRightCorner = { x: 40, y: 20 };
        lengths = { x: bottomRightCorner.x - topLeftCorner.x, y: bottomRightCorner.y - topLeftCorner.y };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#setContextParameters should change the right ctx parameters', () => {
        service.setContextParameters(drawServiceSpy.baseCtx, defaultThickness);
        expect(drawServiceSpy.baseCtx.getLineDash()).toEqual([]);
        expect(drawServiceSpy.baseCtx.lineWidth).toEqual(defaultThickness);
        expect(drawServiceSpy.baseCtx.lineJoin).toEqual('miter');
    });

    it('#draw should draw a rectangle on the canvas at the right position and using the right colours', () => {
        service.thickness = defaultThickness;
        colorServiceSpy.mainColor.opacity = 1;
        colorServiceSpy.secondaryColor.opacity = 1;
        service.traceType = TraceType.FilledAndBordered;
        service.draw(drawServiceSpy.baseCtx, topLeftCorner, bottomRightCorner);

        const borderPoint: Vec2 = { x: 2, y: 10 };
        const centerPoint: Vec2 = { x: 20, y: 10 };
        const outsidePoint: Vec2 = { x: 41, y: 0 };
        const rgbMax = 255;
        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, rgbMax));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, rgbMax, rgbMax));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#draw without border should draw a rectangle on the canvas at the right position and using the right colours', () => {
        service.thickness = defaultThickness;
        colorServiceSpy.mainColor.opacity = 1;
        colorServiceSpy.secondaryColor.opacity = 1;
        service.traceType = TraceType.FilledNoBordered;
        service.draw(drawServiceSpy.baseCtx, topLeftCorner, bottomRightCorner);

        const borderPoint: Vec2 = { x: 2, y: 10 };
        const centerPoint: Vec2 = { x: 20, y: 10 };
        const outsidePoint: Vec2 = { x: 41, y: 10 };
        const rgbMax = 255;
        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, rgbMax, rgbMax));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, rgbMax, rgbMax));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#draw when using alternate shape should draw a square on the canvas at the right position and using the right colours', () => {
        service.thickness = defaultThickness;
        colorServiceSpy.mainColor.opacity = 1;
        colorServiceSpy.secondaryColor.opacity = 1;
        service.traceType = TraceType.Bordered;
        service['alternateShape'] = true;
        service.draw(drawServiceSpy.baseCtx, topLeftCorner, bottomRightCorner);

        const borderPoint: Vec2 = { x: 10, y: 2 };
        const centerPoint: Vec2 = { x: 12, y: 10 };
        const outsidePoint: Vec2 = { x: 22, y: 10 };
        const rgbMax = 255;
        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, rgbMax));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#adjustToWidth should adjust the begin coords and length appropriately', () => {
        const initialWidth = 50;
        const initialCoords = { x: topLeftCorner.x, y: topLeftCorner.y };
        const initialLengths = { x: lengths.x, y: lengths.y };
        drawServiceSpy.previewCtx.lineWidth = initialWidth;
        service.adjustToWidth(drawServiceSpy.previewCtx, lengths, topLeftCorner, bottomRightCorner);
        expect(drawServiceSpy.baseCtx.lineWidth).toBeLessThan(initialWidth);
        expect(topLeftCorner.x).toBeGreaterThan(initialCoords.x);
        expect(topLeftCorner.y).toBeGreaterThan(initialCoords.y);
        expect(lengths.x).toBeLessThan(initialLengths.x);
        expect(lengths.y).toBeLessThan(initialLengths.y);
    });

    it('#adjustToWidth should adjust properly if end coords and begin coords are same (edge case)', () => {
        const initialWidth = 50;
        const initialCoords = { x: topLeftCorner.x, y: topLeftCorner.y };
        const initialLengths = { x: 0, y: 0 };
        drawServiceSpy.previewCtx.lineWidth = initialWidth;
        service.adjustToWidth(drawServiceSpy.previewCtx, initialLengths, topLeftCorner, topLeftCorner);
        expect(drawServiceSpy.baseCtx.lineWidth).toEqual(1);
        expect(topLeftCorner).toEqual(initialCoords);
    });
});
