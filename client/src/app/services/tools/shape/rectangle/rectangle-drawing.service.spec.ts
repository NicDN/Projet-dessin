import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { ShapePropreties, ShapeType } from '@app/classes/commands/shape-command/shape-command';
import { TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShapeService } from '@app/services/tools/shape/shape.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { of } from 'rxjs';
import { RectangleDrawingService } from './rectangle-drawing.service';

// tslint:disable: no-string-literal
describe('RectangleDrawingService', () => {
    let service: RectangleDrawingService;
    let colorServiceSpyObj: jasmine.SpyObj<ColorService>;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;
    let shapeServiceSpyObj: jasmine.SpyObj<ShapeService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let shapePropretiesStub: ShapePropreties;

    const PRIMARY_COLOR_STUB = 'blue';
    const SECONDARY_COLOR_STUB = 'black';
    const OPACITY_STUB = 1;
    const THICKNESS_STUB = 4;
    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 20 };
    const SIDE_LENGTHS_STUB: Vec2 = {
        x: BOTTOM_RIGHT_CORNER_COORDS.x - TOP_LEFT_CORNER_COORDS.x,
        y: BOTTOM_RIGHT_CORNER_COORDS.y - TOP_LEFT_CORNER_COORDS.y,
    };
    const mainColorStub: Color = { rgbValue: PRIMARY_COLOR_STUB, opacity: OPACITY_STUB };
    const secondaryColorStub: Color = { rgbValue: SECONDARY_COLOR_STUB, opacity: OPACITY_STUB };

    const RGB_MAX = 255;

    beforeEach(() => {
        colorServiceSpyObj = jasmine.createSpyObj('ColorService', [], {
            mainColor: { rgbValue: PRIMARY_COLOR_STUB, opacity: OPACITY_STUB },
            secondaryColor: { rgbValue: SECONDARY_COLOR_STUB, opacity: OPACITY_STUB },
        });
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
        shapeServiceSpyObj = jasmine.createSpyObj('ShapeService', [
            'newRectangleDrawing',
            'newEllipseDrawing',
            'newPolygonDrawing',
            'sendDrawRectangleNotifs',
        ]);

        const canvasStub: HTMLCanvasElement = document.createElement('canvas');
        let canvasCtxStub: CanvasRenderingContext2D;
        const stubWidthAndHeight = 100;
        canvasStub.width = stubWidthAndHeight;
        canvasStub.height = stubWidthAndHeight;
        canvasCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;

        shapePropretiesStub = {
            shapeType: ShapeType.Rectangle,
            drawingContext: canvasCtxStub,
            beginCoords: TOP_LEFT_CORNER_COORDS,
            endCoords: BOTTOM_RIGHT_CORNER_COORDS,
            drawingThickness: THICKNESS_STUB,
            mainColor: mainColorStub,
            secondaryColor: secondaryColorStub,
            isAlternateShape: false,
            traceType: TraceType.FilledAndBordered,
        };

        shapeServiceSpyObj.newRectangleDrawing.and.returnValue(of(shapePropretiesStub));
        shapeServiceSpyObj.newEllipseDrawing.and.returnValue(of(shapePropretiesStub));
        shapeServiceSpyObj.newPolygonDrawing.and.returnValue(of(shapePropretiesStub));

        TestBed.configureTestingModule({
            providers: [
                RectangleDrawingService,
                { provide: ColorService, useValue: colorServiceSpyObj },
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: UndoRedoService, useValue: undoRedoServiceSpyObj },
                { provide: ShapeService, useValue: shapeServiceSpyObj },
            ],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(RectangleDrawingService);

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        shapePropretiesStub.drawingContext = service['drawingService'].baseCtx;
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

    it('#drawRectangle should draw a rectangle on the canvas at the right position and using the right colours', () => {
        drawingServiceSpyObj.clearCanvas(shapePropretiesStub.drawingContext);
        service.drawRectangle(shapePropretiesStub);

        // const borderPoint: Vec2 = { x: 2, y: 10 };
        // const centerPoint: Vec2 = { x: 20, y: 10 };
        const outsidePoint: Vec2 = { x: 41, y: 0 };

        // const imageDataBorder: ImageData = shapePropretiesStub.drawingContext.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        // expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, RGB_MAX));
        // const imageDataCenter: ImageData = shapePropretiesStub.drawingContext.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        // expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, RGB_MAX, RGB_MAX));
        const imageDataOutside: ImageData = shapePropretiesStub.drawingContext.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#drawRectangle without border should draw a rectangle on the canvas at the right position and using the right colours', () => {
        shapePropretiesStub.traceType = TraceType.FilledNoBordered;
        drawingServiceSpyObj.clearCanvas(shapePropretiesStub.drawingContext);
        service.drawRectangle(shapePropretiesStub);

        // const borderPoint: Vec2 = { x: 3, y: 3 };
        const centerPoint: Vec2 = { x: 25, y: 15 };
        const outsidePoint: Vec2 = { x: 41, y: 41 };

        // const imageDataBorder: ImageData = shapePropretiesStub.drawingContext.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        // expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, RGB_MAX, RGB_MAX));
        const imageDataCenter: ImageData = shapePropretiesStub.drawingContext.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, RGB_MAX, RGB_MAX));
        const imageDataOutside: ImageData = shapePropretiesStub.drawingContext.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#drawRectangle when using alternate shape should draw a square on the canvas at the right position and using the right colours', () => {
        shapePropretiesStub.isAlternateShape = true;
        shapePropretiesStub.traceType = TraceType.Bordered;
        drawingServiceSpyObj.clearCanvas(shapePropretiesStub.drawingContext);

        service.drawRectangle(shapePropretiesStub);

        // const borderPoint: Vec2 = { x: 2, y: 2 };
        const centerPoint: Vec2 = { x: 22, y: 12 };
        const outsidePoint: Vec2 = { x: 41, y: 41 };

        // const imageDataBorder: ImageData = shapePropretiesStub.drawingContext.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        // expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, RGB_MAX));
        const imageDataCenter: ImageData = shapePropretiesStub.drawingContext.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
        const imageDataOutside: ImageData = shapePropretiesStub.drawingContext.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#draw should loadUp propreties and call drawRectangle', () => {
        const loadUpSpy = spyOn(service, 'loadUpPropreties').and.returnValue(shapePropretiesStub);
        service.draw(baseCtxStub, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);

        // expect(shapeServiceSpyObj.newRectangleDrawing).toHaveBeenCalled();
        expect(loadUpSpy).toHaveBeenCalled();
        expect(shapeServiceSpyObj.sendDrawRectangleNotifs).toHaveBeenCalled();
    });

    it('#adjustToBorder should adjust the begin coords and length appropriately', () => {
        const initialWidth = 50;
        const initialCoords = { x: TOP_LEFT_CORNER_COORDS.x, y: TOP_LEFT_CORNER_COORDS.y };
        const initialLengths = { x: SIDE_LENGTHS_STUB.x, y: SIDE_LENGTHS_STUB.y };
        drawingServiceSpyObj.previewCtx.lineWidth = initialWidth;

        service.adjustToBorder(
            drawingServiceSpyObj.previewCtx,
            SIDE_LENGTHS_STUB,
            TOP_LEFT_CORNER_COORDS,
            BOTTOM_RIGHT_CORNER_COORDS,
            TraceType.Bordered,
        );
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

        service.adjustToBorder(drawingServiceSpyObj.previewCtx, initialLengths, TOP_LEFT_CORNER_COORDS, TOP_LEFT_CORNER_COORDS, TraceType.Bordered);
        expect(drawingServiceSpyObj.baseCtx.lineWidth).toEqual(1);
        expect(TOP_LEFT_CORNER_COORDS).toEqual(initialCoords);
    });

    it('#loadProprities should set the SprayCanPropreties to the current service status so it can be used in the redo', () => {
        const beginAndEnd: Vec2 = { x: 1, y: 2 };

        const shapePropreties: ShapePropreties = service.loadUpPropreties(baseCtxStub, beginAndEnd, beginAndEnd);
        expect(shapePropreties.shapeType).toEqual(ShapeType.Rectangle), expect(shapePropreties.drawingContext).toEqual(baseCtxStub);
        expect(shapePropreties.beginCoords).toEqual(beginAndEnd);
        expect(shapePropreties.mainColor.rgbValue).toEqual(colorServiceSpyObj.mainColor.rgbValue);
        expect(shapePropreties.secondaryColor.rgbValue).toEqual(colorServiceSpyObj.secondaryColor.rgbValue);
        expect(shapePropreties.isAlternateShape).toEqual(service.alternateShape);
        expect(shapePropreties.traceType).toEqual(service.traceType);
    });
});
