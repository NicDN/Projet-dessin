import { TestBed } from '@angular/core/testing';
import { SelectionPropreties, SelectionType } from '@app/classes/commands/selection-command/selection-command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseSelectionService } from '@app/services/tools/selection/ellipse-selection.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle-selection.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

describe('SelectionService', () => {
    let service: SelectionService;
    let drawingServiceStub: DrawingService;
    let rectangleDrawingServiceStub: RectangleDrawingService;
    let undoRedoServiceStub: UndoRedoService;

    let rectangleSelectionServiceStub: RectangleSelectionService;
    let ellipseSelectionServiceStub: EllipseSelectionService;

    const canvasStub: HTMLCanvasElement = document.createElement('canvas');
    let canvasCtxStub: CanvasRenderingContext2D;
    const stubWidthAndHeight = 100;
    canvasStub.width = stubWidthAndHeight;
    canvasStub.height = stubWidthAndHeight;
    canvasCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;

    const INITIAL_TOP_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const INITIAL_BOTTOM_CORNER_COORDS: Vec2 = { x: 40, y: 20 };
    const FINAL_TOP_CORNER_COORDS: Vec2 = { x: 50, y: 30 };
    const FINAL_BOTTOM_CORNER_COORDS: Vec2 = { x: 90, y: 50 };

    const selectionPropretiesStub: SelectionPropreties = {
        selectionType: SelectionType.Rectangle,
        selectionCtx: canvasCtxStub,
        imageData: canvasCtxStub.getImageData(0, 0, 1, 1),
        topLeft: INITIAL_TOP_CORNER_COORDS,
        bottomRight: INITIAL_BOTTOM_CORNER_COORDS,
        finalTopLeft: FINAL_TOP_CORNER_COORDS,
        finalBottomRight: FINAL_BOTTOM_CORNER_COORDS,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SelectionService);
        drawingServiceStub = TestBed.inject(DrawingService);
        rectangleDrawingServiceStub = TestBed.inject(RectangleDrawingService);
        undoRedoServiceStub = TestBed.inject(UndoRedoService);

        rectangleSelectionServiceStub = new RectangleSelectionService(drawingServiceStub, rectangleDrawingServiceStub, undoRedoServiceStub, service);
        ellipseSelectionServiceStub = new EllipseSelectionService(drawingServiceStub, rectangleDrawingServiceStub, undoRedoServiceStub, service);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#sendSelectionRectangleNotifs should call fillwithwhite and drawRectangleSelection ', () => {
        const rectangleSelectionSpy = spyOn(rectangleSelectionServiceStub, 'drawSelectionRectangle');
        const rectangleSFillWithWhiteSpy = spyOn(rectangleSelectionServiceStub, 'fillWithWhite');
        rectangleSelectionServiceStub.listenToNewRectangleDrawingCommands();
        service.sendSelectionRectangleNotifs(selectionPropretiesStub);
        expect(rectangleSelectionSpy).toHaveBeenCalled();
        expect(rectangleSFillWithWhiteSpy).toHaveBeenCalled();
    });

    it('#sendSelectionEllipseNotifs should call fillwithwhite and drawEllipseSelection ', () => {
        const selectionSelectionSpy = spyOn(ellipseSelectionServiceStub, 'drawSelectionEllipse');
        const ellipseFillWithWhiteSpy = spyOn(ellipseSelectionServiceStub, 'fillWithWhite');
        ellipseSelectionServiceStub.listenToNewEllipseSelectionCommands();
        service.sendSelectionEllipseNotifs(selectionPropretiesStub);
        expect(selectionSelectionSpy).toHaveBeenCalled();
        expect(ellipseFillWithWhiteSpy).toHaveBeenCalled();
    });
});
