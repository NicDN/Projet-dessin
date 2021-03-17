import { TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { ShapeType } from '@app/classes/commands/shape-command/shape-command';
import { TraceType } from '@app/classes/shape';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseDrawingService } from '@app/services/tools/shape/ellipse/ellipse-drawing.service';
import { PolygonService } from '@app/services/tools/shape/polygon/polygon.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { RectangleDrawingService } from './rectangle/rectangle-drawing.service';
import { ShapeService } from './shape.service';

describe('ShapeServiceService', () => {
    let service: ShapeService;
    let rectangleDrawingService: RectangleDrawingService;
    let ellipseDrawingService: EllipseDrawingService;
    let polygonDrawingService: PolygonService;
    let drawingServiceStub: DrawingService;
    let colorServiceStub: ColorService;
    let undoRedoServiceStub: UndoRedoService;

    const canvasStub: HTMLCanvasElement = document.createElement('canvas');
    let canvasCtxStub: CanvasRenderingContext2D;
    const stubWidthAndHeight = 100;
    canvasStub.width = stubWidthAndHeight;
    canvasStub.height = stubWidthAndHeight;
    canvasCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;

    const PRIMARY_COLOR_STUB = 'blue';
    const SECONDARY_COLOR_STUB = 'black';
    const OPACITY_STUB = 1;
    const THICKNESS_STUB = 4;
    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 20 };
    const mainColorStub: Color = { rgbValue: PRIMARY_COLOR_STUB, opacity: OPACITY_STUB };
    const secondaryColorStub: Color = { rgbValue: SECONDARY_COLOR_STUB, opacity: OPACITY_STUB };
    const shapePropretiesStub = {
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

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ShapeService);
        drawingServiceStub = TestBed.inject(DrawingService);
        undoRedoServiceStub = TestBed.inject(UndoRedoService);
        colorServiceStub = TestBed.inject(ColorService);

        rectangleDrawingService = new RectangleDrawingService(drawingServiceStub, colorServiceStub, undoRedoServiceStub, service);
        ellipseDrawingService = new EllipseDrawingService(drawingServiceStub, colorServiceStub, undoRedoServiceStub, service);
        polygonDrawingService = new PolygonService(drawingServiceStub, colorServiceStub, undoRedoServiceStub, service);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#sendDrawRectangleNotifs should call the drawRectangle function', () => {
        const rectangleSpy = spyOn(rectangleDrawingService, 'drawRectangle');
        rectangleDrawingService.listenToNewRectangleDrawingCommands();
        service.sendDrawRectangleNotifs(shapePropretiesStub);
        expect(rectangleSpy).toHaveBeenCalled();
    });

    it('#sendDrawEllipseNotifs should call the drawRectangle function', () => {
        const ellipseSpy = spyOn(ellipseDrawingService, 'drawEllipse');
        ellipseDrawingService.listenToNewEllipseDrawingCommands();
        service.sendDrawEllipseNotifs(shapePropretiesStub);
        expect(ellipseSpy).toHaveBeenCalled();
    });

    it('#sendDrawPolygonNotifs should call the drawRectangle function', () => {
        const polygonSpy = spyOn(polygonDrawingService, 'drawPolygon');
        polygonDrawingService.listenToNewPolygonDrawingCommands();
        service.sendDrawPolygonNotifs(shapePropretiesStub);
        expect(polygonSpy).toHaveBeenCalled();
    });
});
