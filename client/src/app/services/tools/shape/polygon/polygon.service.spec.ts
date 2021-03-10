import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { PolygonService } from './polygon.service';

// tslint:disable: no-string-literal
describe('PolygonService', () => {
    let service: PolygonService;
    let colorServiceSpyObj: jasmine.SpyObj<ColorService>;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;

    const PRIMARY_COLOR_STUB = 'blue';
    const SECONDARY_COLOR_STUB = 'black';

    const OPACITY_STUB = 1;
    const THICKNESS_STUB = 4;
    const SIDES_STUB = 4;

    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 20 };
    const RGB_MAX = 255;

    beforeEach(() => {
        colorServiceSpyObj = jasmine.createSpyObj('ColorService', [], {
            mainColor: { rgbValue: PRIMARY_COLOR_STUB, opacity: OPACITY_STUB },
            secondaryColor: { rgbValue: SECONDARY_COLOR_STUB, opacity: OPACITY_STUB },
        });
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', ['']);
        TestBed.configureTestingModule({
            providers: [
                PolygonService,
                { provide: ColorService, useValue: colorServiceSpyObj },
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                {provide: UndoRedoService, useValue: undoRedoServiceSpyObj},
            ],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(PolygonService);

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#setContextParameters should change the right ctx parameters', () => {
        service.setContextParameters(drawingServiceSpyObj.baseCtx, THICKNESS_STUB);
        expect(drawingServiceSpyObj.baseCtx.getLineDash()).toEqual([]);
        expect(drawingServiceSpyObj.baseCtx.lineWidth).toEqual(THICKNESS_STUB);
        expect(drawingServiceSpyObj.baseCtx.lineCap).toEqual('round');
        expect(drawingServiceSpyObj.baseCtx.lineJoin).toEqual('round');
    });

    it('#drawPerimeter should draw a dotted line circle', () => {
        const canvasSpyObj = jasmine.createSpyObj('CanvasRenderingContext2D', ['setLineDash', 'arc', 'stroke', 'beginPath', 'save', 'restore']);

        service.drawPerimeter(canvasSpyObj, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);
        expect(canvasSpyObj.beginPath).toHaveBeenCalled();
        expect(canvasSpyObj.setLineDash).toHaveBeenCalled();
        expect(canvasSpyObj.arc).toHaveBeenCalled();
        expect(canvasSpyObj.stroke).toHaveBeenCalled();
    });

    it('#draw should draw a Polygon on the canvas at the right position and using the right colours', () => {
        service.thickness = THICKNESS_STUB;
        service.traceType = TraceType.FilledAndBordered;
        service.numberOfSides = SIDES_STUB;
        service.draw(drawingServiceSpyObj.baseCtx, TOP_LEFT_CORNER_COORDS, { x: 50, y: 50 });
        const borderPoint: Vec2 = { x: 25, y: 1 };
        const centerPoint: Vec2 = { x: 25, y: 25 };
        const outsidePoint: Vec2 = { x: 51, y: 51 };

        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, RGB_MAX));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, RGB_MAX, RGB_MAX));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#draw  without border should draw a Polygon on the canvas at the right position and using the right colours', () => {
        service.thickness = THICKNESS_STUB;
        service.traceType = TraceType.FilledNoBordered;
        service.numberOfSides = SIDES_STUB;
        service.draw(drawingServiceSpyObj.baseCtx, TOP_LEFT_CORNER_COORDS, { x: 50, y: 50 });
        const borderPoint: Vec2 = { x: 25, y: 1 };
        const centerPoint: Vec2 = { x: 25, y: 25 };
        const outsidePoint: Vec2 = { x: 51, y: 51 };

        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, RGB_MAX, RGB_MAX));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, RGB_MAX, RGB_MAX));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#draw without fill should draw a Polygon on the canvas at the right position and using the right colours', () => {
        service.thickness = THICKNESS_STUB;
        service.traceType = TraceType.Bordered;
        service.numberOfSides = SIDES_STUB;
        service.draw(drawingServiceSpyObj.baseCtx, TOP_LEFT_CORNER_COORDS, { x: 50, y: 50 });
        const borderPoint: Vec2 = { x: 25, y: 1 };
        const centerPoint: Vec2 = { x: 25, y: 25 };
        const outsidePoint: Vec2 = { x: 51, y: 51 };

        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, RGB_MAX));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });
});
