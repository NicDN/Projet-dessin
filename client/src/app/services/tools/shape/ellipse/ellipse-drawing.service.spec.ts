import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseDrawingService } from './ellipse-drawing.service';

describe('EllipseDrawingService', () => {
    let service: EllipseDrawingService;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    const colorStub = 'blue';
    const secondaryColorStub = 'black';
    const opacityStub = 0.4;
    const thicknessStub = 4;
    const topLeftCorner: Vec2 = { x: 0, y: 0 };
    const bottomRightCorner: Vec2 = { x: 40, y: 20 };
    const bottomLeftCorner: Vec2 = { x: 0, y: 20 };
    const topRightCorner: Vec2 = { x: 40, y: 0 };

    beforeEach(() => {
        const spy = jasmine.createSpyObj('ColorService', ['mainColor', 'secondaryColor']);
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            providers: [EllipseDrawingService, { provide: ColorService, useValue: spy }, { provide: DrawingService, useValue: drawServiceSpy }],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(EllipseDrawingService);
        colorServiceSpy = TestBed.inject(ColorService) as jasmine.SpyObj<ColorService>;

        // tslint:disable-next-line: no-string-literal
        service['drawingService'].baseCtx = baseCtxStub;
        // tslint:disable-next-line: no-string-literal
        service['drawingService'].previewCtx = previewCtxStub;

        colorServiceSpy.mainColor.rgbValue = colorStub;
        colorServiceSpy.mainColor.opacity = opacityStub;

        colorServiceSpy.secondaryColor.rgbValue = secondaryColorStub;
        colorServiceSpy.secondaryColor.opacity = opacityStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#setFillColor should change the right ctx parameters', () => {
        // tslint:disable-next-line: no-string-literal
        service.setFillColor(drawServiceSpy.baseCtx, colorServiceSpy.mainColor);
        expect(drawServiceSpy.baseCtx.fillStyle).toEqual('#0000ff');
        expect(drawServiceSpy.baseCtx.globalAlpha).toEqual(opacityStub);
    });

    it('#setStrokeColor should change the right ctx parameters', () => {
        // tslint:disable-next-line: no-string-literal
        service.setStrokeColor(drawServiceSpy.baseCtx, colorServiceSpy.mainColor);
        expect(drawServiceSpy.baseCtx.strokeStyle).toEqual('#0000ff');
        expect(drawServiceSpy.baseCtx.globalAlpha).toEqual(opacityStub);
    });

    it('#setContextParameters should change the right ctx parameters', () => {
        // tslint:disable-next-line: no-string-literal
        service.setContextParameters(drawServiceSpy.baseCtx, thicknessStub);
        expect(drawServiceSpy.baseCtx.getLineDash()).toEqual([]);
        expect(drawServiceSpy.baseCtx.lineWidth).toEqual(thicknessStub);
        expect(drawServiceSpy.baseCtx.lineCap).toEqual('round');
    });

    it('#getActualEndCoords should return same end coords if not using alternate shape', () => {
        // tslint:disable-next-line: no-string-literal
        service['alternateShape'] = false;
        expect(service.getActualEndCoords(topLeftCorner, bottomRightCorner)).toEqual(bottomRightCorner);
        expect(service.getActualEndCoords(bottomRightCorner, topLeftCorner)).toEqual(topLeftCorner);
        expect(service.getActualEndCoords(bottomLeftCorner, topRightCorner)).toEqual(topRightCorner);
        expect(service.getActualEndCoords(topRightCorner, bottomLeftCorner)).toEqual(bottomLeftCorner);
    });

    it('#getActualEndCoords should return coords of square if using alternate shape', () => {
        // tslint:disable-next-line: no-string-literal
        service['alternateShape'] = true;
        expect(service.getActualEndCoords(topLeftCorner, bottomRightCorner)).toEqual({ x: 20, y: 20 });
        expect(service.getActualEndCoords(bottomRightCorner, topLeftCorner)).toEqual({ x: 20, y: 0 });
        expect(service.getActualEndCoords(bottomLeftCorner, topRightCorner)).toEqual({ x: 20, y: 0 });
        expect(service.getActualEndCoords(topRightCorner, bottomLeftCorner)).toEqual({ x: 20, y: 20 });
    });

    it('#getCenterCoords should return coords of the center of the ellipse', () => {
        expect(service.getCenterCoords(topLeftCorner, bottomRightCorner)).toEqual({ x: 20, y: 10 });
        expect(service.getCenterCoords(bottomRightCorner, topLeftCorner)).toEqual({ x: 20, y: 10 });
        expect(service.getCenterCoords(bottomLeftCorner, topRightCorner)).toEqual({ x: 20, y: 10 });
        expect(service.getCenterCoords(topRightCorner, bottomLeftCorner)).toEqual({ x: 20, y: 10 });
    });

    it('#getRadius should return radius of the ellipse', () => {
        service.traceType = TraceType.FilledNoBordered;
        const expectedXRadius = 20;
        const expectedYRadius = 10;
        expect(service.getRadius(topLeftCorner.x, bottomRightCorner.x)).toEqual(expectedXRadius);
        expect(service.getRadius(topLeftCorner.y, bottomRightCorner.y)).toEqual(expectedYRadius);
        expect(service.getRadius(bottomRightCorner.x, topLeftCorner.x)).toEqual(expectedXRadius);
        expect(service.getRadius(bottomRightCorner.y, topLeftCorner.y)).toEqual(expectedYRadius);
    });

    it('should adjust radiuses if ellipse has a certain border width', () => {
        drawServiceSpy.baseCtx.lineWidth = thicknessStub;
        service.traceType = TraceType.FilledAndBordered;
        const radiuses: Vec2 = { x: 20, y: 10 };
        const expectedXRadius = 18;
        const expectedYRadius = 8;
        service.adjustToWidth(drawServiceSpy.baseCtx, radiuses, topLeftCorner, bottomRightCorner);
        expect(radiuses.x).toEqual(expectedXRadius);
        expect(radiuses.y).toEqual(expectedYRadius);
    });

    it('should not adjust radiuses if ellipse doesnt have a border', () => {
        drawServiceSpy.baseCtx.lineWidth = thicknessStub;
        service.traceType = TraceType.FilledNoBordered;
        const radiuses: Vec2 = { x: 20, y: 10 };
        const expectedXRadius = 20;
        const expectedYRadius = 10;
        service.adjustToWidth(drawServiceSpy.baseCtx, radiuses, topLeftCorner, bottomRightCorner);
        expect(radiuses.x).toEqual(expectedXRadius);
        expect(radiuses.y).toEqual(expectedYRadius);
    });

    it('#draw should draw an ellipse on the canvas at the right position and using the right colours', () => {
        service.thickness = thicknessStub;
        colorServiceSpy.mainColor.opacity = 1;
        colorServiceSpy.secondaryColor.opacity = 1;
        service.traceType = TraceType.FilledAndBordered;
        service.draw(drawServiceSpy.baseCtx, topLeftCorner, bottomRightCorner);

        const borderPoint: Vec2 = { x: 2, y: 10 };
        const centerPoint: Vec2 = { x: 20, y: 10 };
        const outsidePoint: Vec2 = { x: 41, y: 10 };
        const rgbMax = 255;
        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, rgbMax));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, rgbMax, rgbMax));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#draw when using alternate shape should draw a circle on the canvas at the right position and using the right colours', () => {
        // tslint:disable-next-line: no-string-literal
        service.thickness = thicknessStub;
        colorServiceSpy.mainColor.opacity = 1;
        colorServiceSpy.secondaryColor.opacity = 1;
        service.traceType = TraceType.Bordered;
        // tslint:disable-next-line: no-string-literal
        service['alternateShape'] = true;
        service.draw(drawServiceSpy.baseCtx, topLeftCorner, bottomRightCorner);

        const borderPoint: Vec2 = { x: 10, y: 2 };
        const centerPoint: Vec2 = { x: 12, y: 10 };
        const outsidePoint: Vec2 = { x: 21, y: 10 };
        const rgbMax = 255;
        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, rgbMax));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('should adjust the width if its bigger than the box containing the ellipse', () => {
        const initialWidth = 50;
        const radius: { x: number; y: number } = { x: -5, y: -15 };
        drawServiceSpy.baseCtx.lineWidth = initialWidth;
        service.adjustToWidth(drawServiceSpy.baseCtx, radius, topLeftCorner, bottomRightCorner);
        expect(drawServiceSpy.baseCtx.lineWidth).toBeLessThan(initialWidth);
        expect(radius.x).toBeGreaterThan(0);
        expect(radius.y).toBeGreaterThan(0);
    });
});
