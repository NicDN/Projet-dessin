import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { SelectionProperties } from '@app/classes/commands/selection-command/selection-command';
import { TraceToolCommand } from '@app/classes/commands/trace-tool-command/trace-tool-command';
import { SelectionTool } from '@app/classes/selection-tool';
import { HORIZONTAL_OFFSET, MouseButton, VERTICAL_OFFSET } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetSelectionService } from '@app/services/tools/selection/magnet/magnet-selection.service';
import { MoveSelectionService, SelectedPoint } from '@app/services/tools/selection/move/move-selection.service';
import { ResizeSelectionService } from '@app/services/tools/selection/resize/resize-selection.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { LineService } from '@app/services/tools/trace-tool/line/line.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { LassoSelectionService } from './lasso-selection.service';

// tslint:disable: no-string-literal
// tslint:disable: no-any
describe('LassoSelectionService', () => {
    let lassoSelectionService: LassoSelectionService;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let rectangleDrawingServiceSpyObj: jasmine.SpyObj<RectangleDrawingService>;
    let lineServiceSpyObj: jasmine.SpyObj<LineService>;
    let undoRedoSpyObj: jasmine.SpyObj<UndoRedoService>;
    let magnetSelectionSpyObj: jasmine.SpyObj<MagnetSelectionService>;
    let resizeSelectionSpyObj: jasmine.SpyObj<ResizeSelectionService>;

    let canvasTestHelper: CanvasTestHelper;
    let moveSelectionServiceSpyObj: jasmine.SpyObj<MoveSelectionService>;
    let mouseEvent: MouseEvent;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let selectionProperties: SelectionProperties;

    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 40 };
    const TOP_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 0 };
    const TOP_LEFT_SELECTION: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_SELECTION: Vec2 = { x: 40, y: 40 };
    const ARBITRARY_POSITION: Vec2 = { x: 100, y: 100 };
    const IMAGE_DATA_SIZE = 20;

    const MOUSE_POSITION: Vec2 = { x: 25, y: 25 };
    const LEFT_BUTTON_PRESSED = 1;
    const NO_BUTTON_PRESSED = 0;

    const RGB_MAX = 255;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        rectangleDrawingServiceSpyObj = jasmine.createSpyObj('RectangleDrawingService', [
            'getTrueEndCoords',
            'drawEllipticalPerimeter',
            'getCenterCoords',
        ]);
        undoRedoSpyObj = jasmine.createSpyObj('UndoRedoService', ['disableUndoRedo']);
        moveSelectionServiceSpyObj = jasmine.createSpyObj('MoveSelectionService', ['moveSelectionWithMouse']);
        lineServiceSpyObj = jasmine.createSpyObj('LineService', [
            'onMouseDown',
            'clearPath',
            'handleMouseMove',
            'checkClosingLoop',
            'onKeyDown',
            'onKeyUp',
        ]);
        magnetSelectionSpyObj = jasmine.createSpyObj('MagnetSelectionService', ['']);
        resizeSelectionSpyObj = jasmine.createSpyObj('ResizeSelectionService', ['checkIfAControlPointHasBeenSelected']);
        TestBed.configureTestingModule({
            providers: [
                LassoSelectionService,
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: RectangleDrawingService, useValue: rectangleDrawingServiceSpyObj },
                { provide: UndoRedoService, useValue: undoRedoSpyObj },
                { provide: MoveSelectionService, useValue: moveSelectionServiceSpyObj },
                { provide: LineService, useValue: lineServiceSpyObj },
                { provide: MagnetSelectionService, useValue: magnetSelectionSpyObj },
                { provide: ResizeSelectionService, useValue: resizeSelectionSpyObj },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        lassoSelectionService = TestBed.inject(LassoSelectionService);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpyObj.canvas = canvasTestHelper.canvas;

        lassoSelectionService['drawingService'].baseCtx = baseCtxStub;
        lassoSelectionService['drawingService'].previewCtx = previewCtxStub;

        selectionProperties = {
            selectionCtx: drawingServiceSpyObj.baseCtx,
            imageData: drawingServiceSpyObj.baseCtx.getImageData(0, 0, IMAGE_DATA_SIZE, IMAGE_DATA_SIZE),
            coords: {
                initialTopLeft: TOP_LEFT_SELECTION,
                initialBottomRight: BOTTOM_RIGHT_SELECTION,
                finalTopLeft: TOP_LEFT_SELECTION,
                finalBottomRight: BOTTOM_RIGHT_SELECTION,
            },
            selectionPathData: [TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS, TOP_RIGHT_CORNER_COORDS, TOP_LEFT_CORNER_COORDS],
            firstPointOffset: { x: 0, y: 0 },
        };

        mouseEvent = {
            pageX: MOUSE_POSITION.x + HORIZONTAL_OFFSET,
            pageY: MOUSE_POSITION.y + VERTICAL_OFFSET,
            button: MouseButton.Left,
            buttons: LEFT_BUTTON_PRESSED,
        } as MouseEvent;

        resizeSelectionSpyObj.selectedPointIndex = SelectedPoint.NO_POINT;
        lineServiceSpyObj.pathData = [];
    });

    it('should be created', () => {
        expect(lassoSelectionService).toBeTruthy();
    });

    it('#onMouseDown should set mouseDown property to true if leftClick', () => {
        lassoSelectionService.onMouseDown(mouseEvent);
        expect(lassoSelectionService.mouseDown).toBeTrue();
    });

    it('#onMouseDown should not set mouseDown property to true if rightClick', () => {
        mouseEvent = {
            pageX: MOUSE_POSITION.x + HORIZONTAL_OFFSET,
            pageY: MOUSE_POSITION.y + VERTICAL_OFFSET,
            button: MouseButton.Right,
        } as MouseEvent;
        lassoSelectionService.onMouseDown(mouseEvent);
        expect(lassoSelectionService.mouseDown).toBeFalse();
    });

    it('#onMouseDown should execute the lineService mouseDown', () => {
        lassoSelectionService.onMouseDown(mouseEvent);
        expect(lineServiceSpyObj.onMouseDown).toHaveBeenCalled();
    });

    it('#onMouseDown should handle the action if clicked inside selection', () => {
        const isInsideSelectionSpy = spyOn<any>(lassoSelectionService, 'isInsideSelection').and.returnValue(true);
        const handleSelectionMouseDownSpy = spyOn<any>(lassoSelectionService, 'handleSelectionMouseDown');
        lassoSelectionService.selectionExists = true;

        lassoSelectionService.onMouseDown(mouseEvent);
        expect(isInsideSelectionSpy).toHaveBeenCalled();
        expect(handleSelectionMouseDownSpy).toHaveBeenCalled();
    });

    it('#onMouseDown should cancel the selection and reset the line path if clicked outside selection', () => {
        const isInsideSelectionSpy = spyOn<any>(lassoSelectionService, 'isInsideSelection').and.returnValue(false);
        const cancelSelectionSpy = spyOn<any>(lassoSelectionService, 'cancelSelection');
        lassoSelectionService.selectionExists = true;

        lassoSelectionService.onMouseDown(mouseEvent);
        expect(isInsideSelectionSpy).toHaveBeenCalled();
        expect(cancelSelectionSpy).toHaveBeenCalled();
        expect(lineServiceSpyObj.clearPath).toHaveBeenCalled();
    });

    it('#onMouseDown should not do anything if the selection doesnt exist', () => {
        const isInsideSelectionSpy = spyOn<any>(lassoSelectionService, 'isInsideSelection');
        const cancelSelectionSpy = spyOn<any>(lassoSelectionService, 'cancelSelection');
        const handleSelectionMouseDownSpy = spyOn<any>(lassoSelectionService, 'handleSelectionMouseDown');
        lassoSelectionService.selectionExists = false;

        lassoSelectionService.onMouseDown(mouseEvent);
        expect(isInsideSelectionSpy).not.toHaveBeenCalled();
        expect(cancelSelectionSpy).not.toHaveBeenCalled();
        expect(lineServiceSpyObj.clearPath).not.toHaveBeenCalled();
        expect(handleSelectionMouseDownSpy).not.toHaveBeenCalled();
    });

    it('#onMouseMove should set mouseDown to false if not moving with left mouse button pressed (edge case)', () => {
        lassoSelectionService.mouseDown = true;
        const mouseEventMove = {
            pageX: MOUSE_POSITION.x + HORIZONTAL_OFFSET,
            pageY: MOUSE_POSITION.y + VERTICAL_OFFSET,
            buttons: NO_BUTTON_PRESSED,
        } as MouseEvent;
        lassoSelectionService.selectionExists = true;

        lassoSelectionService.onMouseMove(mouseEventMove);
        expect(lassoSelectionService.mouseDown).toBeFalse();
    });

    it('#onMouseMove should update the resize properties', () => {
        const updateResizePropertiesSpy = spyOn<any>(lassoSelectionService, 'updateResizeProperties');
        spyOn<any>(lassoSelectionService, 'updatePerimeter').and.stub();

        lassoSelectionService.onMouseMove(mouseEvent);
        expect(updateResizePropertiesSpy).toHaveBeenCalled();
    });

    it('#onMouseMove should resize the selection if there is a control point selected', () => {
        const resizeSelectionSpy = spyOn<any>(lassoSelectionService, 'resizeSelection');
        resizeSelectionSpyObj.selectedPointIndex = SelectedPoint.BOTTOM_LEFT;

        lassoSelectionService.onMouseMove(mouseEvent);
        expect(resizeSelectionSpy).toHaveBeenCalled();
    });

    it('#onMouseMove should move the selection if moving with mouse is true', () => {
        const drawAllSpy = spyOn<any>(lassoSelectionService, 'drawAll');
        moveSelectionServiceSpyObj.movingWithMouse = true;

        lassoSelectionService.onMouseMove(mouseEvent);
        expect(drawAllSpy).toHaveBeenCalled();
        expect(moveSelectionServiceSpyObj.moveSelectionWithMouse).toHaveBeenCalled();
    });

    it('#onMouseMove should call lineService handleMouseMove and update perimeter when tracing a perimeter', () => {
        const updatePerimeterSpy = spyOn<any>(lassoSelectionService, 'updatePerimeter');

        lassoSelectionService.onMouseMove(mouseEvent);
        expect(updatePerimeterSpy).toHaveBeenCalled();
        expect(lineServiceSpyObj.handleMouseMove).toHaveBeenCalled();
    });

    it('#onMouseUp should set mouseDown to false', () => {
        lassoSelectionService.mouseDown = true;

        lassoSelectionService.onMouseUp(mouseEvent);
        expect(lassoSelectionService.mouseDown).toBeFalse();
    });

    it('#onMouseUp should set the resize selected point to no point', () => {
        resizeSelectionSpyObj.selectedPointIndex = SelectedPoint.BOTTOM_LEFT;
        lassoSelectionService.mouseDown = true;

        lassoSelectionService.onMouseUp(mouseEvent);
        expect(resizeSelectionSpyObj.selectedPointIndex).toEqual(SelectedPoint.NO_POINT);
    });

    it('#onMouseUp should set movingWithMouse to false', () => {
        moveSelectionServiceSpyObj.movingWithMouse = true;
        lassoSelectionService.mouseDown = true;

        lassoSelectionService.onMouseUp(mouseEvent);
        expect(moveSelectionServiceSpyObj.movingWithMouse).toBeFalse();
    });

    it('#onMouseUp should disable undoRedo if there is a perimeter being traced', () => {
        lineServiceSpyObj.pathData = [TOP_LEFT_CORNER_COORDS];
        lassoSelectionService.mouseDown = true;

        lassoSelectionService.onMouseUp(mouseEvent);
        expect(undoRedoSpyObj.disableUndoRedo).toHaveBeenCalled();
    });

    it('#onMouseUp should not push a point to the path data if there are lines crossing each other', () => {
        const checkIfLineCrossingSpy = spyOn<any>(lassoSelectionService, 'checkIfLineCrossing').and.returnValue(true);
        const pushSpy = spyOn<any>(lineServiceSpyObj.pathData, 'push');
        lassoSelectionService.mouseDown = true;

        lassoSelectionService.onMouseUp(mouseEvent);
        expect(pushSpy).not.toHaveBeenCalled();
        expect(checkIfLineCrossingSpy).toHaveBeenCalled();
    });

    it('#onMouseUp should push a point to the path data if there are no lines crossing each other', () => {
        const checkIfLineCrossingSpy = spyOn<any>(lassoSelectionService, 'checkIfLineCrossing').and.returnValue(false);
        const pushSpy = spyOn<any>(lineServiceSpyObj.pathData, 'push');
        lassoSelectionService.mouseDown = true;

        lassoSelectionService.onMouseUp(mouseEvent);
        expect(pushSpy).toHaveBeenCalled();
        expect(checkIfLineCrossingSpy).toHaveBeenCalled();
    });

    it('#onMouseUp should close the loop if #checkClosingLoop returns true and the path is long enough', () => {
        const checkIfLineCrossingSpy = spyOn<any>(lassoSelectionService, 'checkIfLineCrossing').and.returnValue(false);
        const closeLoopSpy = spyOn<any>(lassoSelectionService, 'closeLoop');
        lineServiceSpyObj.checkClosingLoop.and.returnValue(true);
        lineServiceSpyObj.pathData = [TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS, TOP_RIGHT_CORNER_COORDS, TOP_RIGHT_CORNER_COORDS];
        lassoSelectionService.mouseDown = true;

        lassoSelectionService.onMouseUp(mouseEvent);
        expect(closeLoopSpy).toHaveBeenCalled();
        expect(checkIfLineCrossingSpy).toHaveBeenCalled();
    });

    it('#onMouseUp should not do anything if mouseDown is false', () => {
        const checkIfLineCrossingSpy = spyOn<any>(lassoSelectionService, 'checkIfLineCrossing').and.returnValue(false);
        moveSelectionServiceSpyObj.movingWithMouse = true;
        resizeSelectionSpyObj.selectedPointIndex = SelectedPoint.BOTTOM_LEFT;
        const pushSpy = spyOn<any>(lineServiceSpyObj.pathData, 'push');

        lassoSelectionService.onMouseUp(mouseEvent);
        expect(resizeSelectionSpyObj.selectedPointIndex).not.toEqual(SelectedPoint.NO_POINT);
        expect(moveSelectionServiceSpyObj.movingWithMouse).toBeTrue();
        expect(pushSpy).not.toHaveBeenCalled();
        expect(checkIfLineCrossingSpy).not.toHaveBeenCalled();
    });

    it('#closeLoop should pop back two elements of the path data, and then push the first point', () => {
        spyOn<any>(lassoSelectionService, 'checkIfLineCrossing').and.returnValue(true);
        lineServiceSpyObj.pathData = [
            TOP_LEFT_CORNER_COORDS,
            BOTTOM_RIGHT_CORNER_COORDS,
            TOP_RIGHT_CORNER_COORDS,
            BOTTOM_RIGHT_CORNER_COORDS,
            TOP_RIGHT_CORNER_COORDS,
        ];
        const initialPathDataLength = lineServiceSpyObj.pathData.length;
        lassoSelectionService['closeLoop']();

        expect(lineServiceSpyObj.pathData.length).toEqual(initialPathDataLength - 1);
        expect(lineServiceSpyObj.pathData[lineServiceSpyObj.pathData.length - 1]).toEqual(TOP_LEFT_CORNER_COORDS);
    });

    it('#closeLoop should clearCanvas, calcuteInitialCoords and createSelection if there are no lines crossing', () => {
        const calculateInitialCoordsSpy = spyOn<any>(lassoSelectionService, 'calculateInitialCoords');
        const createSelectionSpy = spyOn<any>(lassoSelectionService, 'createSelection');
        const checkIfLineCrossingSpy = spyOn<any>(lassoSelectionService, 'checkIfLineCrossing').and.returnValue(false);

        lassoSelectionService['closeLoop']();
        expect(calculateInitialCoordsSpy).toHaveBeenCalled();
        expect(createSelectionSpy).toHaveBeenCalled();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(checkIfLineCrossingSpy).toHaveBeenCalled();
    });

    it('#onKeyDown should call the parent class onKeyDown if a selectionExists', () => {
        const onKeyDownSpy = spyOn<any>(SelectionTool.prototype, 'onKeyDown');
        lassoSelectionService.selectionExists = true;

        lassoSelectionService.onKeyDown({} as KeyboardEvent);
        expect(onKeyDownSpy).toHaveBeenCalled();
    });

    it('#onKeyDown should clear the linePath if a selectionExists and Escape key pressed', () => {
        spyOn<any>(SelectionTool.prototype, 'onKeyDown').and.stub();
        lassoSelectionService.selectionExists = true;

        lassoSelectionService.onKeyDown({ code: 'Escape' } as KeyboardEvent);
        expect(lineServiceSpyObj.clearPath).toHaveBeenCalled();
    });

    it('#onKeyDown should call lineService onKeyDown and update perimeter if selection doesnt exist', () => {
        lassoSelectionService.selectionExists = false;
        const updatePerimeterSpy = spyOn<any>(lassoSelectionService, 'updatePerimeter');

        lassoSelectionService.onKeyDown({} as KeyboardEvent);
        expect(lineServiceSpyObj.onKeyDown).toHaveBeenCalled();
        expect(updatePerimeterSpy).toHaveBeenCalled();
    });

    it('#onKeyUp should call the parent class onKeyUp if a selectionExists', () => {
        const onKeyUpSpy = spyOn<any>(SelectionTool.prototype, 'onKeyUp');
        lassoSelectionService.selectionExists = true;

        lassoSelectionService.onKeyUp({} as KeyboardEvent);
        expect(onKeyUpSpy).toHaveBeenCalled();
    });

    it('#onKeyUp should call lineService onKeyUp and update perimeter if selection doesnt exist', () => {
        lassoSelectionService.selectionExists = false;
        const updatePerimeterSpy = spyOn<any>(lassoSelectionService, 'updatePerimeter');

        lassoSelectionService.onKeyUp({} as KeyboardEvent);
        expect(lineServiceSpyObj.onKeyUp).toHaveBeenCalled();
        expect(updatePerimeterSpy).toHaveBeenCalled();
    });

    it('#loadUpLineProperties should return TraceToolProperties with correct values', () => {
        const path = [TOP_LEFT_CORNER_COORDS, TOP_RIGHT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS];

        const traceToolProperties = lassoSelectionService['loadUpLinePropreties'](drawingServiceSpyObj.baseCtx, path);

        expect(traceToolProperties.drawingContext).toEqual(drawingServiceSpyObj.baseCtx);
        expect(traceToolProperties.drawingPath).toEqual(path);
        expect(traceToolProperties.drawingThickness).toEqual(1);
        expect(traceToolProperties.drawingColor).toEqual({ rgbValue: 'black', opacity: 1 });
        expect(traceToolProperties.drawWithJunction).toEqual(false);
        expect(traceToolProperties.junctionDiameter).toEqual(1);
    });

    it('#loadUpProperties should return SelectionProperties with correct values', () => {
        lineServiceSpyObj.pathData = [TOP_LEFT_CORNER_COORDS, TOP_RIGHT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS];
        lassoSelectionService.firstPointOffset = TOP_LEFT_SELECTION;
        lassoSelectionService.coords = selectionProperties.coords;
        lassoSelectionService.data = selectionProperties.imageData;

        const newSelectionProperties = lassoSelectionService['loadUpProperties'](drawingServiceSpyObj.baseCtx);

        expect(newSelectionProperties.selectionCtx).toEqual(drawingServiceSpyObj.baseCtx);
        expect(newSelectionProperties.selectionPathData).toEqual(lineServiceSpyObj.pathData);
        expect(newSelectionProperties.firstPointOffset).toEqual(TOP_LEFT_SELECTION);
        expect(newSelectionProperties.coords).toEqual(selectionProperties.coords);
        expect(newSelectionProperties.imageData).toEqual(selectionProperties.imageData);
    });

    it('#updatePerimeter should calculateInitialCoords, clear the preview canvas and drawPerimeter', () => {
        const calculateInitialCoordsSpy = spyOn<any>(lassoSelectionService, 'calculateInitialCoords');
        const drawPerimeterSpy = spyOn<any>(lassoSelectionService, 'drawPerimeter');

        lassoSelectionService['updatePerimeter']();
        expect(calculateInitialCoordsSpy).toHaveBeenCalled();
        expect(drawPerimeterSpy).toHaveBeenCalled();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
    });

    it('#drawPerimeter should scaleContext if selection exists', () => {
        lassoSelectionService.selectionExists = true;
        const scaleContextSpy = spyOn<any>(lassoSelectionService, 'scaleContext');
        spyOn<any>(TraceToolCommand.prototype, 'execute').and.stub();

        lassoSelectionService.drawPerimeter(drawingServiceSpyObj.baseCtx, TOP_LEFT_SELECTION, BOTTOM_RIGHT_SELECTION);
        expect(scaleContextSpy).toHaveBeenCalled();
    });

    it('#drawPerimeter should execute a line command', () => {
        const commandExecute = spyOn<any>(TraceToolCommand.prototype, 'execute');
        lineServiceSpyObj.pathData = selectionProperties.selectionPathData as Vec2[];
        lassoSelectionService.firstPointOffset = TOP_LEFT_SELECTION;

        lassoSelectionService.drawPerimeter(drawingServiceSpyObj.baseCtx, TOP_LEFT_SELECTION, BOTTOM_RIGHT_SELECTION);
        expect(commandExecute).toHaveBeenCalled();
    });

    it('#drawSelection should make the path, scale the context, and draw the image on the canvas', () => {
        const clipSpy = spyOn<any>(drawingServiceSpyObj.baseCtx, 'clip');
        const drawImageSpy = spyOn<any>(drawingServiceSpyObj.baseCtx, 'drawImage');
        const makePathSpy = spyOn<any>(lassoSelectionService, 'makePath');
        const scaleContextSpy = spyOn<any>(lassoSelectionService, 'scaleContext');

        lassoSelectionService.drawSelection(selectionProperties);
        expect(clipSpy).toHaveBeenCalled();
        expect(drawImageSpy).toHaveBeenCalled();
        expect(makePathSpy).toHaveBeenCalled();
        expect(scaleContextSpy).toHaveBeenCalled();
    });

    it('#drawSelection should return if the selectionCtx is undefined', () => {
        selectionProperties.selectionCtx = undefined;
        const clipSpy = spyOn<any>(drawingServiceSpyObj.baseCtx, 'clip');
        const drawImageSpy = spyOn<any>(drawingServiceSpyObj.baseCtx, 'drawImage');
        const makePathSpy = spyOn<any>(lassoSelectionService, 'makePath');
        const scaleContextSpy = spyOn<any>(lassoSelectionService, 'scaleContext');
        lassoSelectionService.drawSelection(selectionProperties);

        expect(clipSpy).not.toHaveBeenCalled();
        expect(drawImageSpy).not.toHaveBeenCalled();
        expect(makePathSpy).not.toHaveBeenCalled();
        expect(scaleContextSpy).not.toHaveBeenCalled();
    });

    it('#fillWithWhite should fill an polygonal area with white', () => {
        drawingServiceSpyObj.baseCtx.fillStyle = 'red';
        drawingServiceSpyObj.baseCtx.fillRect(
            TOP_LEFT_CORNER_COORDS.x,
            TOP_LEFT_CORNER_COORDS.y,
            BOTTOM_RIGHT_CORNER_COORDS.x,
            BOTTOM_RIGHT_CORNER_COORDS.y,
        );

        lassoSelectionService.fillWithWhite(selectionProperties);

        const insidePoint: Vec2 = { x: 30, y: 5 };
        const outsidePoint: Vec2 = { x: 5, y: 25 };

        const imageDataInside: ImageData = baseCtxStub.getImageData(insidePoint.x, insidePoint.y, 1, 1);
        expect(imageDataInside.data).toEqual(Uint8ClampedArray.of(RGB_MAX, RGB_MAX, RGB_MAX, RGB_MAX));
        const imageDataOutside: ImageData = baseCtxStub.getImageData(outsidePoint.x, outsidePoint.y, 1, 1);
        expect(imageDataOutside.data).toEqual(Uint8ClampedArray.of(RGB_MAX, 0, 0, RGB_MAX));
    });

    it('#fillWithWhite should return if the selectionCtx is undefined', () => {
        selectionProperties.selectionCtx = undefined;
        const makePathSpy = spyOn<any>(lassoSelectionService, 'makePath');

        lassoSelectionService.fillWithWhite(selectionProperties);
        expect(makePathSpy).not.toHaveBeenCalled();
    });

    it('#makePath should begin the path and trace it out', () => {
        const beginPathSpy = spyOn<any>(drawingServiceSpyObj.baseCtx, 'beginPath');
        const lineToSpy = spyOn<any>(drawingServiceSpyObj.baseCtx, 'lineTo');

        lassoSelectionService['makePath'](selectionProperties, TOP_LEFT_CORNER_COORDS);

        expect(beginPathSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalledTimes(selectionProperties.selectionPathData?.length as number);
    });

    it('#makePath should return if the selectionCtx is undefined', () => {
        selectionProperties.selectionCtx = undefined;
        const beginPathSpy = spyOn<any>(drawingServiceSpyObj.baseCtx, 'beginPath');
        const lineToSpy = spyOn<any>(drawingServiceSpyObj.baseCtx, 'lineTo');

        lassoSelectionService['makePath'](selectionProperties, TOP_LEFT_CORNER_COORDS);
        expect(beginPathSpy).not.toHaveBeenCalled();
        expect(lineToSpy).not.toHaveBeenCalled();
    });

    it('#calculateInitialCoords should calculte the initialTopLeft and initialBottom right, as well as firstPointOffset', () => {
        lineServiceSpyObj.pathData = selectionProperties.selectionPathData as Vec2[];

        lassoSelectionService.coords.initialTopLeft = ARBITRARY_POSITION;
        lassoSelectionService.coords.initialBottomRight = ARBITRARY_POSITION;
        lassoSelectionService.firstPointOffset = ARBITRARY_POSITION;

        lassoSelectionService['calculateInitialCoords']();
        expect(lassoSelectionService.coords.initialTopLeft).toEqual(TOP_LEFT_CORNER_COORDS);
        expect(lassoSelectionService.coords.initialBottomRight).toEqual(BOTTOM_RIGHT_CORNER_COORDS);
        expect(lassoSelectionService.firstPointOffset).toEqual({ x: 0, y: 0 });
    });

    it('#calculateInitialCoords should not do anything if pathData length is zero', () => {
        lineServiceSpyObj.pathData = [];

        lassoSelectionService.coords.initialTopLeft = ARBITRARY_POSITION;
        lassoSelectionService.coords.initialBottomRight = ARBITRARY_POSITION;
        lassoSelectionService.firstPointOffset = ARBITRARY_POSITION;

        lassoSelectionService['calculateInitialCoords']();
        expect(lassoSelectionService.coords.initialTopLeft).not.toEqual(TOP_LEFT_CORNER_COORDS);
        expect(lassoSelectionService.coords.initialBottomRight).not.toEqual(BOTTOM_RIGHT_CORNER_COORDS);
        expect(lassoSelectionService.firstPointOffset).not.toEqual({ x: 0, y: 0 });
    });

    it('#checkIfLineCrossing should verify the condition for each line in the path, except the last one, as long as not crossings are found', () => {
        const calculateIntersectPointSpy = spyOn<any>(lassoSelectionService, 'calculateIntersectPoint');
        const intersectInBoundsSpy = spyOn<any>(lassoSelectionService, 'intersectInBounds').and.returnValue(false);
        const ignoredCrossings = 3;

        lineServiceSpyObj.pathData = [
            TOP_LEFT_CORNER_COORDS,
            BOTTOM_RIGHT_CORNER_COORDS,
            TOP_RIGHT_CORNER_COORDS,
            TOP_LEFT_CORNER_COORDS,
            BOTTOM_RIGHT_CORNER_COORDS,
            TOP_LEFT_CORNER_COORDS,
        ];

        const lineCrossing = lassoSelectionService['checkIfLineCrossing']();
        expect(calculateIntersectPointSpy).toHaveBeenCalledTimes(lineServiceSpyObj.pathData.length - ignoredCrossings);
        expect(intersectInBoundsSpy).toHaveBeenCalledTimes(lineServiceSpyObj.pathData.length - ignoredCrossings);
        expect(lineCrossing).toBeFalse();
    });

    it('#checkIfLineCrossing should return true if at least of the line combinations were crossing', () => {
        const calculateIntersectPointSpy = spyOn<any>(lassoSelectionService, 'calculateIntersectPoint');
        const intersectInBoundsSpy = spyOn<any>(lassoSelectionService, 'intersectInBounds').and.returnValue(true);
        lineServiceSpyObj.pathData = [
            TOP_LEFT_CORNER_COORDS,
            BOTTOM_RIGHT_CORNER_COORDS,
            TOP_RIGHT_CORNER_COORDS,
            TOP_LEFT_CORNER_COORDS,
            BOTTOM_RIGHT_CORNER_COORDS,
            TOP_LEFT_CORNER_COORDS,
        ];

        const lineCrossing = lassoSelectionService['checkIfLineCrossing']();
        expect(calculateIntersectPointSpy).toHaveBeenCalledTimes(1);
        expect(intersectInBoundsSpy).toHaveBeenCalledTimes(1);
        expect(lineCrossing).toBeTrue();
    });

    it('#checkIfLineCrossing should return false if the two last points are the same, edge case right after adding a new point', () => {
        const calculateIntersectPointSpy = spyOn<any>(lassoSelectionService, 'calculateIntersectPoint');
        const intersectInBoundsSpy = spyOn<any>(lassoSelectionService, 'intersectInBounds');
        lineServiceSpyObj.pathData = [
            TOP_LEFT_CORNER_COORDS,
            BOTTOM_RIGHT_CORNER_COORDS,
            TOP_RIGHT_CORNER_COORDS,
            TOP_LEFT_CORNER_COORDS,
            BOTTOM_RIGHT_CORNER_COORDS,
            BOTTOM_RIGHT_CORNER_COORDS,
        ];

        const lineCrossing = lassoSelectionService['checkIfLineCrossing']();
        expect(calculateIntersectPointSpy).not.toHaveBeenCalled();
        expect(intersectInBoundsSpy).not.toHaveBeenCalled();
        expect(lineCrossing).toBeFalse();
    });

    it('#calculateIntersectPoint should calculate the intersect between two lines A and B', () => {
        const a1: Vec2 = { x: 0, y: 0 };
        const a2: Vec2 = { x: 20, y: 20 };
        const b1: Vec2 = { x: 0, y: 20 };
        const b2: Vec2 = { x: 20, y: 0 };

        expect(lassoSelectionService['calculateIntersectPoint'](a1, a2, b1, b2)).toEqual({ x: 10, y: 10 });
        expect(lassoSelectionService['calculateIntersectPoint'](a2, a1, b2, b1)).toEqual({ x: 10, y: 10 });
        expect(lassoSelectionService['calculateIntersectPoint'](b1, a2, b2, a2)).toEqual({ x: 20, y: 20 });
        expect(lassoSelectionService['calculateIntersectPoint'](a1, a2, a1, b1)).toEqual({ x: 0, y: 0 });
        expect(lassoSelectionService['calculateIntersectPoint'](a1, b2, a2, b1).x).toBePositiveInfinity();
        expect(lassoSelectionService['calculateIntersectPoint'](a1, b1, b2, a2).y).toBeNaN();
    });

    it('#intersectInBounds should return true if the insersection point of two lines is in their bounds, false otherwise', () => {
        const a1: Vec2 = { x: 0, y: 0 };
        const a2: Vec2 = { x: 20, y: 20 };
        const b1: Vec2 = { x: 0, y: 20 };
        const b2: Vec2 = { x: 20, y: 0 };
        const c1: Vec2 = { x: 30, y: 0 };
        const c2: Vec2 = { x: 30, y: 20 };
        const d1: Vec2 = { x: 0, y: 10 };
        const d2: Vec2 = { x: 20, y: 10 };

        const intersectAB = { x: 10, y: 10 };
        const intersectAC = { x: 30, y: 30 };
        const intersectCB = { x: 30, y: -10 };
        const intersectBD = { x: 10, y: 10 };

        expect(lassoSelectionService['intersectInBounds'](a1, a2, b1, b2, intersectAB)).toBeTrue();
        expect(lassoSelectionService['intersectInBounds'](a2, a1, b1, b2, intersectAB)).toBeTrue();
        expect(lassoSelectionService['intersectInBounds'](a1, a2, c1, c2, intersectAC)).toBeFalse();
        expect(lassoSelectionService['intersectInBounds'](b1, b2, c1, c2, intersectCB)).toBeFalse();
        expect(lassoSelectionService['intersectInBounds'](c1, c2, b1, b2, intersectCB)).toBeFalse();
        expect(lassoSelectionService['intersectInBounds'](b1, b2, d1, d2, intersectBD)).toBeTrue();
        expect(lassoSelectionService['intersectInBounds'](d1, d2, b1, b2, intersectBD)).toBeTrue();
    });
    // tslint:disable-next-line: max-file-line-count
});
