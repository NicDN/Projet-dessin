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
import { EllipseDrawingService } from './ellipse-drawing.service';

// tslint:disable: no-string-literal
describe('EllipseDrawingService', () => {
    let service: EllipseDrawingService;
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
    const mainColorStub: Color = { rgbValue: PRIMARY_COLOR_STUB, opacity: OPACITY_STUB };
    const secondaryColorStub: Color = { rgbValue: SECONDARY_COLOR_STUB, opacity: OPACITY_STUB };

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

        shapeServiceSpyObj = jasmine.createSpyObj('ShapeService', [
            'newRectangleDrawing',
            'newEllipseDrawing',
            'newPolygonDrawing',
            'sendDrawEllipseNotifs',
        ]);

        const canvasStub: HTMLCanvasElement = document.createElement('canvas');
        let canvasCtxStub: CanvasRenderingContext2D;
        const stubWidthAndHeight = 100;
        canvasStub.width = stubWidthAndHeight;
        canvasStub.height = stubWidthAndHeight;
        canvasCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;
        canvasCtxStub.fillStyle = 'black';

        shapePropretiesStub = {
            shapeType: ShapeType.Ellipse,
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
                EllipseDrawingService,
                { provide: ColorService, useValue: colorServiceSpyObj },
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: UndoRedoService, useValue: undoRedoServiceSpyObj },
                { provide: ShapeService, useValue: shapeServiceSpyObj },
            ],
        });

        service = TestBed.inject(EllipseDrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

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
    });

    it('#drawEllipse should draw an ellipse on the canvas at the right position and using the right colours', () => {
        // service.thickness = THICKNESS_STUB;
        // service.traceType = TraceType.FilledAndBordered;
        // service.draw(drawingServiceSpyObj.baseCtx, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);

        shapePropretiesStub.traceType = TraceType.FilledAndBordered;
        shapePropretiesStub.drawingContext = baseCtxStub;
        service.drawEllipse(shapePropretiesStub);

        const borderPoint: Vec2 = { x: 2, y: 10 };
        const centerPoint: Vec2 = { x: 20, y: 10 };
        const outsidePoint: Vec2 = { x: 41, y: 10 };

        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, RGB_MAX));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, RGB_MAX, RGB_MAX));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#drawEllipse without border should draw an ellipse on the canvas at the right position and using the right colours', () => {
        // service.thickness = THICKNESS_STUB;
        // service.traceType = TraceType.FilledNoBordered;
        // service.draw(drawingServiceSpyObj.baseCtx, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);

        shapePropretiesStub.traceType = TraceType.FilledNoBordered;
        shapePropretiesStub.drawingContext = baseCtxStub;

        service.drawEllipse(shapePropretiesStub);

        const borderPoint: Vec2 = { x: 1, y: 1 };
        const centerPoint: Vec2 = { x: 20, y: 10 };
        const outsidePoint: Vec2 = { x: 41, y: 10 };

        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, RGB_MAX, RGB_MAX));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#drawEllipse when using alternate shape should draw a circle on the canvas at the right position and using the right colours', () => {
        // service.thickness = THICKNESS_STUB;
        // service.traceType = TraceType.Bordered;
        // service['alternateShape'] = true;
        // service.draw(drawingServiceSpyObj.baseCtx, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);

        shapePropretiesStub.traceType = TraceType.Bordered;
        shapePropretiesStub.isAlternateShape = true;
        shapePropretiesStub.drawingContext = baseCtxStub;

        service.drawEllipse(shapePropretiesStub);

        const borderPoint: Vec2 = { x: 10, y: 2 };
        const centerPoint: Vec2 = { x: 12, y: 10 };
        const outsidePoint: Vec2 = { x: 21, y: 10 };

        const imageDataBorder: ImageData = baseCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data).toEqual(Uint8ClampedArray.of(0, 0, 0, RGB_MAX));
        const imageDataCenter: ImageData = baseCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
    });

    it('#draw should loadUp propreties and call drawEllipse', () => {
        const loadUpSpy = spyOn(service, 'loadUpPropreties').and.returnValue(shapePropretiesStub);
        spyOn(service, 'drawEllipse');
        service.draw(baseCtxStub, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);

        expect(shapeServiceSpyObj.sendDrawEllipseNotifs).toHaveBeenCalled();
        expect(loadUpSpy).toHaveBeenCalled();
    });

    it('#loadProprities should set the SprayCanPropreties to the current service status so it can be used in the redo', () => {
        const beginAndEnd: Vec2 = { x: 1, y: 2 };

        const shapePropreties: ShapePropreties = service.loadUpPropreties(baseCtxStub, beginAndEnd, beginAndEnd);
        expect(shapePropreties.shapeType).toEqual(ShapeType.Ellipse);
        expect(shapePropreties.drawingContext).toEqual(baseCtxStub);
        expect(shapePropreties.beginCoords).toEqual(beginAndEnd);
        expect(shapePropreties.mainColor.rgbValue).toEqual(colorServiceSpyObj.mainColor.rgbValue);
        expect(shapePropreties.secondaryColor.rgbValue).toEqual(colorServiceSpyObj.secondaryColor.rgbValue);
        expect(shapePropreties.isAlternateShape).toEqual(service.alternateShape);
        expect(shapePropreties.traceType).toEqual(service.traceType);
    });
});
