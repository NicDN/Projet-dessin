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
    let shapeServiceSpyObj: jasmine.SpyObj<ShapeService>;
    let shapePropretiesStub: ShapePropreties;

    const PRIMARY_COLOR_STUB = 'blue';
    const SECONDARY_COLOR_STUB = 'black';

    const OPACITY_STUB = 1;
    const THICKNESS_STUB = 4;
    const SIDES_STUB = 4;

    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 50, y: 50 };
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
            'sendDrawPolygonNotifs',
        ]);
        shapePropretiesStub = {
            shapeType: ShapeType.Polygon,
            drawingContext: baseCtxStub,
            beginCoords: TOP_LEFT_CORNER_COORDS,
            endCoords: BOTTOM_RIGHT_CORNER_COORDS,
            drawingThickness: THICKNESS_STUB,
            mainColor: mainColorStub,
            secondaryColor: secondaryColorStub,
            isAlternateShape: true,
            traceType: TraceType.FilledAndBordered,
            numberOfSides: SIDES_STUB,
        };

        shapeServiceSpyObj.newRectangleDrawing.and.returnValue(of(shapePropretiesStub));
        shapeServiceSpyObj.newEllipseDrawing.and.returnValue(of(shapePropretiesStub));
        shapeServiceSpyObj.newPolygonDrawing.and.returnValue(of(shapePropretiesStub));

        TestBed.configureTestingModule({
            providers: [
                PolygonService,
                { provide: ColorService, useValue: colorServiceSpyObj },
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: UndoRedoService, useValue: undoRedoServiceSpyObj },
                { provide: ShapeService, usevalue: shapeServiceSpyObj },
            ],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(PolygonService);

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
        expect(drawingServiceSpyObj.baseCtx.lineCap).toEqual('round');
        expect(drawingServiceSpyObj.baseCtx.lineJoin).toEqual('round');
    });

    it('#drawPerimeter should draw a dotted line circle', () => {
        const canvasSpyObj = jasmine.createSpyObj('CanvasRenderingContext2D', ['setLineDash', 'ellipse', 'stroke', 'beginPath', 'save', 'restore']);

        service.drawPerimeter(canvasSpyObj, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);
        expect(canvasSpyObj.beginPath).toHaveBeenCalled();
        expect(canvasSpyObj.setLineDash).toHaveBeenCalled();
        expect(canvasSpyObj.ellipse).toHaveBeenCalled();
        expect(canvasSpyObj.stroke).toHaveBeenCalled();
    });

    it('#drawPolygon should draw a Polygon on the canvas at the right position and using the right colours', () => {
        service.drawPolygon(shapePropretiesStub);
        const borderPoint: Vec2 = { x: 25, y: 2 };
        const centerPoint: Vec2 = { x: 25, y: 25 };
        const outsidePoint: Vec2 = { x: 51, y: 51 };

        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, RGB_MAX));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, RGB_MAX, RGB_MAX));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#drawPolygon  without border should draw a Polygon on the canvas at the right position and using the right colours', () => {
        shapePropretiesStub.traceType = TraceType.FilledNoBordered;
        service.drawPolygon(shapePropretiesStub);
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

    it('#drawPolygon without fill should draw a Polygon on the canvas at the right position and using the right colours', () => {
        shapePropretiesStub.traceType = TraceType.Bordered;
        service.drawPolygon(shapePropretiesStub);
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

    it('#drawPolygon should return if number of sides is undefined', () => {
        shapePropretiesStub.numberOfSides = undefined;
        const getCenterCoordsSpy = spyOn(service, 'getCenterCoords');
        service.drawPolygon(shapePropretiesStub);
        expect(getCenterCoordsSpy).not.toHaveBeenCalled();
    });

    it('#loadUpPropreties should set the ShapePropreties to current service so it can be used in the redo', () => {
        const polygonPropreties: ShapePropreties = service.loadUpPropreties(baseCtxStub, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);
        expect(polygonPropreties.shapeType).toEqual(ShapeType.Polygon);
        expect(polygonPropreties.drawingContext).toEqual(baseCtxStub);
        expect(polygonPropreties.beginCoords).toEqual(TOP_LEFT_CORNER_COORDS);
        expect(polygonPropreties.mainColor.rgbValue).toEqual(colorServiceSpyObj.mainColor.rgbValue);
        expect(polygonPropreties.secondaryColor.rgbValue).toEqual(colorServiceSpyObj.secondaryColor.rgbValue);
        expect(polygonPropreties.traceType).toEqual(service.traceType);
        expect(polygonPropreties.numberOfSides).toEqual(service.numberOfSides);
    });

    it('#draw should loadUpPropreties and call drawPolygon', () => {
        const loadUpSpy = spyOn(service, 'loadUpPropreties').and.returnValue(shapePropretiesStub);
        const drawPolygonSpy = spyOn(service, 'drawPolygon');
        service.draw(baseCtxStub, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);

        expect(loadUpSpy).toHaveBeenCalled();
        expect(drawPolygonSpy).toHaveBeenCalled();
    });

    it('#executeShapeCommand should call execute of polygon and add the command to the stack of undoRedo', () => {
        const polygonSpy = spyOn(service, 'drawPolygon');
        service.listenToNewPolygonDrawingCommands();
        service.executeShapeCommand(baseCtxStub, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);
        expect(undoRedoServiceSpyObj.addCommand).toHaveBeenCalled();
        expect(polygonSpy).toHaveBeenCalled();
    });
});
