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

    const primaryColorStub = 'blue';
    const secondaryColorStub = 'black';
    const opacityStub = 1;
    const thicknessStub = 4;
    let topLeftCorner: Vec2 = { x: 0, y: 0 };
    let bottomRightCorner: Vec2 = { x: 40, y: 20 };
    let sideLengthsStub: Vec2;

    const rgbMax = 255;

    beforeEach(() => {
        colorServiceSpyObj = jasmine.createSpyObj('ColorService', [], {
            mainColor: { rgbValue: primaryColorStub, opacity: opacityStub },
            secondaryColor: { rgbValue: secondaryColorStub, opacity: opacityStub },
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

        topLeftCorner = { x: 0, y: 0 };
        bottomRightCorner = { x: 40, y: 20 };
        sideLengthsStub = { x: bottomRightCorner.x - topLeftCorner.x, y: bottomRightCorner.y - topLeftCorner.y };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#setContextParameters should change the right ctx parameters', () => {
        service.setContextParameters(drawingServiceSpyObj.baseCtx, thicknessStub);
        expect(drawingServiceSpyObj.baseCtx.getLineDash()).toEqual([]);
        expect(drawingServiceSpyObj.baseCtx.lineWidth).toEqual(thicknessStub);
        expect(drawingServiceSpyObj.baseCtx.lineJoin).toEqual('miter');
    });

    it('#draw should draw a rectangle on the canvas at the right position and using the right colours', () => {
        service.thickness = thicknessStub;
        service.traceType = TraceType.FilledAndBordered;
        service.draw(drawingServiceSpyObj.baseCtx, topLeftCorner, bottomRightCorner);

        const borderPoint: Vec2 = { x: 2, y: 10 };
        const centerPoint: Vec2 = { x: 20, y: 10 };
        const outsidePoint: Vec2 = { x: 41, y: 0 };

        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, rgbMax));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, rgbMax, rgbMax));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#draw without border should draw a rectangle on the canvas at the right position and using the right colours', () => {
        service.thickness = thicknessStub;
        service.traceType = TraceType.FilledNoBordered;
        service.draw(drawingServiceSpyObj.baseCtx, topLeftCorner, bottomRightCorner);

        const borderPoint: Vec2 = { x: 2, y: 10 };
        const centerPoint: Vec2 = { x: 20, y: 10 };
        const outsidePoint: Vec2 = { x: 41, y: 10 };

        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, rgbMax, rgbMax));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, rgbMax, rgbMax));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#draw when using alternate shape should draw a square on the canvas at the right position and using the right colours', () => {
        service.thickness = thicknessStub;
        service.traceType = TraceType.Bordered;
        service['alternateShape'] = true;
        service.draw(drawingServiceSpyObj.baseCtx, topLeftCorner, bottomRightCorner);

        const borderPoint: Vec2 = { x: 10, y: 2 };
        const centerPoint: Vec2 = { x: 12, y: 10 };
        const outsidePoint: Vec2 = { x: 22, y: 10 };

        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, rgbMax));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#adjustToBorder should adjust the begin coords and length appropriately', () => {
        const initialWidth = 50;
        const initialCoords = { x: topLeftCorner.x, y: topLeftCorner.y };
        const initialLengths = { x: sideLengthsStub.x, y: sideLengthsStub.y };
        drawingServiceSpyObj.previewCtx.lineWidth = initialWidth;

        service.adjustToBorder(drawingServiceSpyObj.previewCtx, sideLengthsStub, topLeftCorner, bottomRightCorner);
        expect(drawingServiceSpyObj.baseCtx.lineWidth).toBeLessThan(initialWidth);
        expect(topLeftCorner.x).toBeGreaterThan(initialCoords.x);
        expect(topLeftCorner.y).toBeGreaterThan(initialCoords.y);
        expect(sideLengthsStub.x).toBeLessThan(initialLengths.x);
        expect(sideLengthsStub.y).toBeLessThan(initialLengths.y);
    });

    it('#adjustToWidth should adjust properly if end coords and begin coords are same (edge case)', () => {
        const initialWidth = 50;
        const initialCoords = { x: topLeftCorner.x, y: topLeftCorner.y };
        const initialLengths = { x: 0, y: 0 };
        drawingServiceSpyObj.previewCtx.lineWidth = initialWidth;

        service.adjustToBorder(drawingServiceSpyObj.previewCtx, initialLengths, topLeftCorner, topLeftCorner);
        expect(drawingServiceSpyObj.baseCtx.lineWidth).toEqual(1);
        expect(topLeftCorner).toEqual(initialCoords);
    });
});
