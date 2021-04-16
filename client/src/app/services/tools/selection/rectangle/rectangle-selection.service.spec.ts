import { TestBed } from '@angular/core/testing';
import { BoxSize } from '@app/classes/box-size';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { SelectionProperties } from '@app/classes/commands/selection-command/selection-command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MoveSelectionService } from '@app/services/tools/selection/move-selection.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { of } from 'rxjs';
import { RectangleSelectionService } from './rectangle-selection.service';

// tslint:disable: no-string-literal
// tslint:disable: no-any
describe('RectangleSelectionService', () => {
    let rectangleSelectionService: RectangleSelectionService;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let rectangleDrawingServiceSpyObj: jasmine.SpyObj<RectangleDrawingService>;
    let undoRedoSpyObj: jasmine.SpyObj<UndoRedoService>;
    let canvasTestHelper: CanvasTestHelper;
    let moveSelectionServiceSpyObj: jasmine.SpyObj<MoveSelectionService>;
    const IMAGE_DATA_SIZE = 20;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let selectionProperties: SelectionProperties;

    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 40 };
    const TOP_LEFT_SELECTION: Vec2 = { x: 5, y: 5 };
    const BOTTOM_RIGHT_SELECTION: Vec2 = { x: 20, y: 20 };
    const RGB_MAX = 255;

    const boxSizeStub: BoxSize = { widthBox: 100, heightBox: 100 };

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['newIncomingResizeSignals', 'newGridSignals']);
        // tslint:disable-next-line: prefer-const
        let emptyMessage: any;
        drawingServiceSpyObj.newGridSignals.and.returnValue(of(emptyMessage));
        drawingServiceSpyObj.newIncomingResizeSignals.and.returnValue(of(boxSizeStub));
        rectangleDrawingServiceSpyObj = jasmine.createSpyObj('RectangleDrawingService', ['getTrueEndCoords', 'drawPerimeter']);
        undoRedoSpyObj = jasmine.createSpyObj('UndoRedoService', ['']);
        moveSelectionServiceSpyObj = jasmine.createSpyObj('MoveSelectionService', ['']);

        TestBed.configureTestingModule({
            providers: [
                RectangleSelectionService,
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: RectangleDrawingService, useValue: rectangleDrawingServiceSpyObj },
                { provide: UndoRedoService, useValue: undoRedoSpyObj },
                { provide: MoveSelectionService, useValue: moveSelectionServiceSpyObj },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        rectangleSelectionService = TestBed.inject(RectangleSelectionService);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpyObj.canvas = canvasTestHelper.canvas;

        rectangleSelectionService['drawingService'].baseCtx = baseCtxStub;
        rectangleSelectionService['drawingService'].previewCtx = previewCtxStub;

        selectionProperties = {
            selectionCtx: drawingServiceSpyObj.baseCtx,
            imageData: drawingServiceSpyObj.baseCtx.getImageData(0, 0, IMAGE_DATA_SIZE, IMAGE_DATA_SIZE),
            initialTopLeft: TOP_LEFT_SELECTION,
            initialBottomRight: BOTTOM_RIGHT_SELECTION,
            finalTopLeft: TOP_LEFT_SELECTION,
            finalBottomRight: BOTTOM_RIGHT_SELECTION,
        } as SelectionProperties;
    });

    it('should be created', () => {
        expect(rectangleSelectionService).toBeTruthy();
    });

    it('#drawPerimeter should get the trueEndCoords and draw a rectangular perimeter using the rectangleDrawingService', () => {
        rectangleSelectionService.drawPerimeter(drawingServiceSpyObj.previewCtx, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);

        expect(rectangleDrawingServiceSpyObj.getTrueEndCoords).toHaveBeenCalled();
        expect(rectangleDrawingServiceSpyObj.drawPerimeter).toHaveBeenCalled();
    });

    it('#fillWithWhite should fill a rectangular area with white', () => {
        drawingServiceSpyObj.baseCtx.fillStyle = 'red';
        drawingServiceSpyObj.baseCtx.fillRect(
            TOP_LEFT_CORNER_COORDS.x,
            TOP_LEFT_CORNER_COORDS.y,
            BOTTOM_RIGHT_CORNER_COORDS.x,
            BOTTOM_RIGHT_CORNER_COORDS.y,
        );

        rectangleSelectionService.fillWithWhite(selectionProperties);

        const insidePoint: Vec2 = { x: 6, y: 6 };
        const insidePoint2: Vec2 = { x: 15, y: 15 };
        const outsidePoint: Vec2 = { x: 4, y: 4 };
        const outsidePoint2: Vec2 = { x: 35, y: 10 };

        const imageDataInside: ImageData = baseCtxStub.getImageData(insidePoint.x, insidePoint.y, 1, 1);
        expect(imageDataInside.data).toEqual(Uint8ClampedArray.of(RGB_MAX, RGB_MAX, RGB_MAX, RGB_MAX));
        const imageDataInside2: ImageData = baseCtxStub.getImageData(insidePoint2.x, insidePoint2.y, 1, 1);
        expect(imageDataInside2.data).toEqual(Uint8ClampedArray.of(RGB_MAX, RGB_MAX, RGB_MAX, RGB_MAX));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(RGB_MAX, 0, 0, RGB_MAX));
        const imageDataOutside2: ImageData = baseCtxStub.getImageData(outsidePoint2.x, outsidePoint2.y, 1, 1);
        expect(imageDataOutside2.data).toEqual(Uint8ClampedArray.of(RGB_MAX, 0, 0, RGB_MAX));
    });

    it('#fillWithWhite should return if selection context is undefined', () => {
        selectionProperties.selectionCtx = undefined;
        const beginPathSpy = spyOn(drawingServiceSpyObj.baseCtx, 'beginPath');

        rectangleSelectionService.fillWithWhite(selectionProperties);
        expect(beginPathSpy).not.toHaveBeenCalled();
    });

    it('#drawSelection should put the image data at the final coords', () => {
        const putImageDataSpy = spyOn(drawingServiceSpyObj.baseCtx, 'translate');
        rectangleSelectionService.drawSelection(selectionProperties);
        expect(putImageDataSpy).toHaveBeenCalled();
    });

    it('#drawSelection should return if the selectionCtx is undefined', () => {
        selectionProperties.selectionCtx = undefined;
        const putImageDataSpy = spyOn(drawingServiceSpyObj.baseCtx, 'putImageData');
        rectangleSelectionService.drawSelection(selectionProperties);
        expect(putImageDataSpy).not.toHaveBeenCalled();
    });
});
