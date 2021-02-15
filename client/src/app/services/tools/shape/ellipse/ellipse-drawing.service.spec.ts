import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseDrawingService } from './ellipse-drawing.service';

// tslint:disable: no-string-literal
describe('EllipseDrawingService', () => {
    let service: EllipseDrawingService;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    const PRIMARY_COLOR = 'blue';
    const SECONDARY_COLOR = 'black';

    const DEFAULT_OPACITY = 1;
    const DEFAULT_THICKNESS = 4;

    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 20 };
    const BOTTOM_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 20 };
    const TOP_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 0 };

    beforeEach(() => {
        const colorSpy = jasmine.createSpyObj('ColorService', [], {
            mainColor: { rgbValue: PRIMARY_COLOR, opacity: DEFAULT_OPACITY },
            secondaryColor: { rgbValue: SECONDARY_COLOR, opacity: DEFAULT_OPACITY },
        });
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            providers: [EllipseDrawingService, { provide: ColorService, useValue: colorSpy }, { provide: DrawingService, useValue: drawServiceSpy }],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(EllipseDrawingService);
        colorServiceSpy = TestBed.inject(ColorService) as jasmine.SpyObj<ColorService>;

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#setContextParameters should change the right ctx parameters', () => {
        service.setContextParameters(drawServiceSpy.baseCtx, DEFAULT_THICKNESS);
        expect(drawServiceSpy.baseCtx.getLineDash()).toEqual([]);
        expect(drawServiceSpy.baseCtx.lineWidth).toEqual(DEFAULT_THICKNESS);
        expect(drawServiceSpy.baseCtx.lineCap).toEqual('round');
    });

    it('#getCenterCoords should return coords of the center of the ellipse', () => {
        expect(service.getCenterCoords(TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS)).toEqual({ x: 20, y: 10 });
        expect(service.getCenterCoords(BOTTOM_RIGHT_CORNER_COORDS, TOP_LEFT_CORNER_COORDS)).toEqual({ x: 20, y: 10 });
        expect(service.getCenterCoords(BOTTOM_LEFT_CORNER_COORDS, TOP_RIGHT_CORNER_COORDS)).toEqual({ x: 20, y: 10 });
        expect(service.getCenterCoords(TOP_RIGHT_CORNER_COORDS, BOTTOM_LEFT_CORNER_COORDS)).toEqual({ x: 20, y: 10 });
    });

    it('#getRadius should return radius of the ellipse', () => {
        const expectedXRadius = 20;
        const expectedYRadius = 10;
        service.traceType = TraceType.FilledNoBordered;
        expect(service.getRadius(TOP_LEFT_CORNER_COORDS.x, BOTTOM_RIGHT_CORNER_COORDS.x)).toEqual(expectedXRadius);
        expect(service.getRadius(TOP_LEFT_CORNER_COORDS.y, BOTTOM_RIGHT_CORNER_COORDS.y)).toEqual(expectedYRadius);
        expect(service.getRadius(BOTTOM_RIGHT_CORNER_COORDS.x, TOP_LEFT_CORNER_COORDS.x)).toEqual(expectedXRadius);
        expect(service.getRadius(BOTTOM_RIGHT_CORNER_COORDS.y, TOP_LEFT_CORNER_COORDS.y)).toEqual(expectedYRadius);
    });

    it('#adjustToWidth should adjust radiuses if ellipse has a certain border width', () => {
        const expectedXRadius = 18;
        const expectedYRadius = 8;
        const radiuses: Vec2 = { x: 20, y: 10 };
        drawServiceSpy.baseCtx.lineWidth = DEFAULT_THICKNESS;
        service.traceType = TraceType.FilledAndBordered;
        service.adjustToWidth(drawServiceSpy.baseCtx, radiuses, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);
        expect(radiuses.x).toEqual(expectedXRadius);
        expect(radiuses.y).toEqual(expectedYRadius);
    });

    it('#adjustToWidth should not adjust radiuses if ellipse doesnt have a border', () => {
        const radiuses: Vec2 = { x: 20, y: 10 };
        const expectedXRadius = 20;
        const expectedYRadius = 10;
        drawServiceSpy.baseCtx.lineWidth = DEFAULT_THICKNESS;
        service.traceType = TraceType.FilledNoBordered;
        service.adjustToWidth(drawServiceSpy.baseCtx, radiuses, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);
        expect(radiuses.x).toEqual(expectedXRadius);
        expect(radiuses.y).toEqual(expectedYRadius);
    });

    it('#draw should draw an ellipse on the canvas at the right position and using the right colours', () => {
        service.thickness = DEFAULT_THICKNESS;
        colorServiceSpy.mainColor.opacity = 1;
        colorServiceSpy.secondaryColor.opacity = 1;
        service.traceType = TraceType.FilledAndBordered;
        service.draw(drawServiceSpy.baseCtx, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);

        const borderPoint: Vec2 = { x: 2, y: 10 };
        const centerPoint: Vec2 = { x: 20, y: 10 };
        const outsidePoint: Vec2 = { x: 41, y: 10 };
        const RGB_MAX = 255;
        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, RGB_MAX));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, RGB_MAX, RGB_MAX));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#draw without border should draw an ellipse on the canvas at the right position and using the right colours', () => {
        service.thickness = DEFAULT_THICKNESS;
        colorServiceSpy.mainColor.opacity = 1;
        colorServiceSpy.secondaryColor.opacity = 1;
        service.traceType = TraceType.FilledNoBordered;
        service.draw(drawServiceSpy.baseCtx, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);

        const borderPoint: Vec2 = { x: 2, y: 10 };
        const centerPoint: Vec2 = { x: 20, y: 10 };
        const outsidePoint: Vec2 = { x: 41, y: 10 };
        const RGB_MAX = 255;
        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, RGB_MAX, RGB_MAX));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, RGB_MAX, RGB_MAX));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#draw when using alternate shape should draw a circle on the canvas at the right position and using the right colours', () => {
        service.thickness = DEFAULT_THICKNESS;
        colorServiceSpy.mainColor.opacity = 1;
        colorServiceSpy.secondaryColor.opacity = 1;
        service.traceType = TraceType.Bordered;
        service['alternateShape'] = true;
        service.draw(drawServiceSpy.baseCtx, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);

        const borderPoint: Vec2 = { x: 10, y: 2 };
        const centerPoint: Vec2 = { x: 12, y: 10 };
        const outsidePoint: Vec2 = { x: 21, y: 10 };
        const RGB_MAX = 255;
        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, RGB_MAX));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#adjustToWidth should adjust the width if its bigger than the box containing the ellipse', () => {
        const initialWidth = 50;
        const radius: Vec2 = { x: -5, y: -15 };
        drawServiceSpy.baseCtx.lineWidth = initialWidth;
        service.adjustToWidth(drawServiceSpy.baseCtx, radius, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);
        expect(drawServiceSpy.baseCtx.lineWidth).toBeLessThan(initialWidth);
        expect(radius.x).toBeGreaterThan(0);
        expect(radius.y).toBeGreaterThan(0);
    });

    it('#adjustToWidth should adjust radiuses and width if begin and end are the same point (edge case, necessary)', () => {
        const initialWidth = 50;
        const radius: Vec2 = { x: 0, y: 0 };
        drawServiceSpy.baseCtx.lineWidth = initialWidth;
        service.adjustToWidth(drawServiceSpy.baseCtx, radius, BOTTOM_RIGHT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);
        expect(drawServiceSpy.baseCtx.lineWidth).toEqual(1);
        expect(radius.x).toEqual(1);
        expect(radius.y).toEqual(1);
    });
});
