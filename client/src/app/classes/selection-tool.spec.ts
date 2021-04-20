import { TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetSelectionService } from '@app/services/tools/selection/magnet/magnet-selection.service';
import { MoveSelectionService, SelectedPoint } from '@app/services/tools/selection/move/move-selection.service';
import { ResizeSelectionService } from '@app/services/tools/selection/resize/resize-selection.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { CanvasTestHelper } from './canvas-test-helper';
import { SelectionCoords, SelectionTool } from './selection-tool';
import { HORIZONTAL_OFFSET, MouseButton, VERTICAL_OFFSET } from './tool';
import { Vec2 } from './vec2';

export class SelectionToolStub extends SelectionTool {
    drawPerimeter(): void {
        return;
    }
    drawSelection(): void {
        return;
    }
    fillWithWhite(): void {
        return;
    }
    constructor(
        drawingService: DrawingService,
        rectangleDrawingService: RectangleDrawingService,
        undoRedoService: UndoRedoService,
        moveSelectionService: MoveSelectionService,
        resizeSelectionService: ResizeSelectionService,
        magnetSelectionService: MagnetSelectionService,
    ) {
        super(drawingService, rectangleDrawingService, 'Stub', undoRedoService, moveSelectionService, resizeSelectionService, magnetSelectionService);
    }
}
// tslint:disable: no-any
// tslint:disable: no-string-literal
describe('SelectionTool', () => {
    let selectionTool: SelectionTool;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let rectangleDrawingServiceSpyObj: jasmine.SpyObj<RectangleDrawingService>;
    let undoRedoSpyObj: jasmine.SpyObj<UndoRedoService>;
    let moveSelectionServiceSpyObj: jasmine.SpyObj<MoveSelectionService>;
    let magnetSelectionServiceSpyObj: jasmine.SpyObj<MagnetSelectionService>;
    let resizeSelectionSpyObj: jasmine.SpyObj<ResizeSelectionService>;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    const MOUSE_POSITION: Vec2 = { x: 25, y: 25 };
    const MOUSE_OFFSET = 5;
    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 20 };
    const LEFT_BUTTON_PRESSED = 1;
    const NO_BUTTON_PRESSED = 0;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        rectangleDrawingServiceSpyObj = jasmine.createSpyObj('RectangleDrawingService', ['getTrueEndCoords', 'onKeyUp', 'onKeyDown']);
        undoRedoSpyObj = jasmine.createSpyObj('UndoRedoService', ['disableUndoRedo', 'enableUndoRedo', 'addCommand']);
        moveSelectionServiceSpyObj = jasmine.createSpyObj('moveSelectionService', [
            'calculateDelta',
            'checkIfAnyArrowIsPressed',
            'updateArrowKeysPressed',
            'moveSelectionWithArrows',
            'moveSelectionWithMouse',
        ]);

        magnetSelectionServiceSpyObj = jasmine.createSpyObj('MagnetSelectionService', ['']);
        resizeSelectionSpyObj = jasmine.createSpyObj('ResizeSelectionService', ['checkIfAControlPointHasBeenSelected', 'resizeSelection', 'drawBox']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: RectangleDrawingService, useValue: rectangleDrawingServiceSpyObj },
                { provide: UndoRedoService, useValue: undoRedoSpyObj },
                { provide: MoveSelectionService, useValue: moveSelectionServiceSpyObj },
                { provide: MagnetSelectionService, useValue: magnetSelectionServiceSpyObj },
            ],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpyObj.canvas = canvasTestHelper.canvas;

        selectionTool = new SelectionToolStub(
            drawingServiceSpyObj,
            rectangleDrawingServiceSpyObj,
            undoRedoSpyObj,
            moveSelectionServiceSpyObj,
            resizeSelectionSpyObj,
            magnetSelectionServiceSpyObj,
        );

        selectionTool['drawingService'].baseCtx = baseCtxStub;
        selectionTool['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            pageX: MOUSE_POSITION.x + HORIZONTAL_OFFSET,
            pageY: MOUSE_POSITION.y + VERTICAL_OFFSET,
            button: MouseButton.Left,
            buttons: LEFT_BUTTON_PRESSED,
        } as MouseEvent;

        resizeSelectionSpyObj['selectedPointIndex'] = SelectedPoint.NO_POINT;
    });

    it('#onMouseDown should set mouseDown property to true if leftClick', () => {
        selectionTool.onMouseDown(mouseEvent);
        expect(selectionTool.mouseDown).toBeTrue();
    });

    it('#onMouseDown should not set mouseDown property to true if rightClick', () => {
        mouseEvent = {
            pageX: MOUSE_POSITION.x + HORIZONTAL_OFFSET,
            pageY: MOUSE_POSITION.y + VERTICAL_OFFSET,
            button: MouseButton.Right,
        } as MouseEvent;
        selectionTool.onMouseDown(mouseEvent);
        expect(selectionTool.mouseDown).toBeFalse();
    });

    it('#onMouseDown should initialize values for initialTopLeft and initialBottomRight if there is no selection yet', () => {
        selectionTool.selectionExists = false;
        selectionTool.onMouseDown(mouseEvent);
        expect(selectionTool['coords'].initialTopLeft).toEqual(MOUSE_POSITION);
        expect(selectionTool['coords'].initialBottomRight).toEqual(MOUSE_POSITION);
        expect(undoRedoSpyObj.disableUndoRedo).toHaveBeenCalled();
    });

    it('#onMouseDown should call handleSelection handleSelectionMouseDown', () => {
        selectionTool.selectionExists = false;
        spyOn<any>(selectionTool, 'isInsideSelection').and.returnValue(true);
        selectionTool['selectionExists'] = true;
        const handleSelectionOnMouseDown = spyOn<any>(selectionTool, 'handleSelectionMouseDown');
        selectionTool.onMouseDown(mouseEvent);
        expect(handleSelectionOnMouseDown).toHaveBeenCalled();
    });

    it('#onMouseDown should cancelSelection if clicked outside of selection', () => {
        selectionTool.selectionExists = true;
        const isInsideSelectionSpy = spyOn<any>(selectionTool, 'isInsideSelection').and.returnValue(false);
        const cancelSelectionSpy = spyOn(selectionTool, 'cancelSelection');

        selectionTool.onMouseDown(mouseEvent);
        expect(isInsideSelectionSpy).toHaveBeenCalled();
        expect(cancelSelectionSpy).toHaveBeenCalled();
    });

    it('#handleSelectionMouseDown should set movingWithMouse to true and shoud set a mouseOffset if clicked inside a selection', () => {
        selectionTool.selectionExists = true;
        const setOffsetSpy = spyOn<any>(selectionTool, 'setOffSet').and.returnValue({} as Vec2);
        resizeSelectionSpyObj['selectedPointIndex'] = SelectedPoint.CENTER;
        moveSelectionServiceSpyObj['movingWithMouse'] = false;
        resizeSelectionSpyObj.checkIfAControlPointHasBeenSelected.and.returnValue();
        selectionTool['handleSelectionMouseDown'](mouseEvent);
        expect(moveSelectionServiceSpyObj['movingWithMouse']).toBeTrue();

        expect(setOffsetSpy).toHaveBeenCalled();
    });

    it('#handleSelectionMouseDown should not call the moveSelectionService methods if not resizing', () => {
        selectionTool.selectionExists = true;
        const setOffsetSpy = spyOn<any>(selectionTool, 'setOffSet').and.returnValue({} as Vec2);
        resizeSelectionSpyObj['selectedPointIndex'] = SelectedPoint.BOTTOM_MIDDLE;
        moveSelectionServiceSpyObj['movingWithMouse'] = false;
        resizeSelectionSpyObj.checkIfAControlPointHasBeenSelected.and.returnValue();
        selectionTool['handleSelectionMouseDown'](mouseEvent);
        expect(moveSelectionServiceSpyObj['movingWithMouse']).toBeFalse();
        expect(setOffsetSpy).not.toHaveBeenCalled();
    });

    it('#onMouseMove should set mouseDown to false if not moving with left mouse button pressed (edge case)', () => {
        selectionTool.mouseDown = true;
        const mouseEventMove = {
            pageX: MOUSE_POSITION.x + HORIZONTAL_OFFSET,
            pageY: MOUSE_POSITION.y + VERTICAL_OFFSET,
            buttons: NO_BUTTON_PRESSED,
        } as MouseEvent;
        const drawAllSpy = spyOn<any>(selectionTool, 'drawAll');
        selectionTool.onMouseMove(mouseEventMove);
        expect(drawAllSpy).not.toHaveBeenCalled();
        expect(selectionTool.mouseDown).toBeFalse();
    });

    it('#onMouseMove should set initialBottomRight coordinate and draw a perimeter box bounded by canvas when not moving a selection', () => {
        selectionTool.mouseDown = true;
        selectionTool.selectionExists = true;
        moveSelectionServiceSpyObj['movingWithMouse'] = false;
        const adjustToDrawingBoundsSpy = spyOn<any>(selectionTool, 'adjustToDrawingBounds');
        const drawPerimeterSpy = spyOn(selectionTool, 'drawPerimeter');

        selectionTool.onMouseMove(mouseEvent);

        expect(selectionTool['coords'].initialBottomRight).toEqual(MOUSE_POSITION);
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(adjustToDrawingBoundsSpy).toHaveBeenCalled();
        expect(drawPerimeterSpy).toHaveBeenCalled();
    });

    it('#onMouseMove should call resize selection methods', () => {
        selectionTool.mouseDown = true;
        selectionTool.selectionExists = true;
        resizeSelectionSpyObj['selectedPointIndex'] = SelectedPoint.BOTTOM_MIDDLE;
        moveSelectionServiceSpyObj['movingWithMouse'] = false;
        const drawAllSpy = spyOn<any>(selectionTool, 'drawAll');
        selectionTool.onMouseMove(mouseEvent);
        expect(resizeSelectionSpyObj.resizeSelection).toHaveBeenCalled();
        expect(drawAllSpy).toHaveBeenCalled();
    });

    it('#onMouseMove should call #moveSelectionWithMouse if moving a selection', () => {
        selectionTool.mouseDown = true;
        selectionTool.selectionExists = true;
        moveSelectionServiceSpyObj['movingWithMouse'] = true;
        selectionTool.onMouseMove(mouseEvent);
        expect(moveSelectionServiceSpyObj.moveSelectionWithMouse).toHaveBeenCalled();
    });

    it('#onMouseUp should set mouseDown and/or movingWithMouse to false', () => {
        selectionTool.mouseDown = true;
        moveSelectionServiceSpyObj['movingWithMouse'] = true;
        selectionTool.onMouseUp(mouseEvent);
        expect(selectionTool.mouseDown).toBeFalse();
        expect(moveSelectionServiceSpyObj['movingWithMouse']).toBeFalse();
    });

    it('#onMouseMove should put resizeSelectionServicePreview to moving if it is inside selection but not on a point', () => {
        spyOn<any>(selectionTool, 'isInsideSelection').and.returnValue(true);
        resizeSelectionSpyObj.checkIfAControlPointHasBeenSelected.and.returnValues();
        selectionTool.mouseDown = true;
        selectionTool.selectionExists = true;
        moveSelectionServiceSpyObj['movingWithMouse'] = false;
        selectionTool.onMouseMove(mouseEvent);
        expect(resizeSelectionSpyObj.previewSelectedPointIndex).toEqual(SelectedPoint.MOVING);
    });

    it('#onMouseUp should handleOnMouseUp if not moving nor resizing a selection', () => {
        selectionTool.mouseDown = true;
        moveSelectionServiceSpyObj['movingWithMouse'] = false;
        const handleSelectionMouseUpSpy = spyOn<any>(selectionTool, 'handleSelectionMouseUp');
        const mouseEventUp = {
            pageX: BOTTOM_RIGHT_CORNER_COORDS.x + HORIZONTAL_OFFSET,
            pageY: BOTTOM_RIGHT_CORNER_COORDS.y + VERTICAL_OFFSET,
        } as MouseEvent;

        selectionTool.onMouseUp(mouseEventUp);
        expect(handleSelectionMouseUpSpy).toHaveBeenCalled();
    });

    it('#handleSelectionMouseUp should set initialBottomRight to the correct coords and create a selection', () => {
        selectionTool.mouseDown = true;
        moveSelectionServiceSpyObj['movingWithMouse'] = false;
        const mouseEventUp = {
            pageX: BOTTOM_RIGHT_CORNER_COORDS.x + HORIZONTAL_OFFSET,
            pageY: BOTTOM_RIGHT_CORNER_COORDS.y + VERTICAL_OFFSET,
        } as MouseEvent;
        const trueEndCoords = { x: 20, y: 20 };
        rectangleDrawingServiceSpyObj.alternateShape = true;
        rectangleDrawingServiceSpyObj.getTrueEndCoords.and.returnValue(trueEndCoords);
        const adjustToDrawingBoundsSpy = spyOn<any>(selectionTool, 'adjustToDrawingBounds');
        const createSelectionSpy = spyOn<any>(selectionTool, 'createSelection');

        selectionTool['handleSelectionMouseUp'](mouseEventUp);

        expect(selectionTool['coords'].initialBottomRight).toEqual(trueEndCoords);
        expect(adjustToDrawingBoundsSpy).toHaveBeenCalled();
        expect(rectangleDrawingServiceSpyObj.getTrueEndCoords).toHaveBeenCalled();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(createSelectionSpy).toHaveBeenCalled();
        expect(rectangleDrawingServiceSpyObj.alternateShape).toBeFalse();
    });

    it('#mouseUp shouldnt do anything if mouseDown is false', () => {
        selectionTool.mouseDown = false;
        moveSelectionServiceSpyObj['movingWithMouse'] = false;
        const createSelectionSpy = spyOn<any>(selectionTool, 'createSelection');

        selectionTool.onMouseUp(mouseEvent);

        expect(rectangleDrawingServiceSpyObj.getTrueEndCoords).not.toHaveBeenCalled();
        expect(drawingServiceSpyObj.clearCanvas).not.toHaveBeenCalled();
        expect(createSelectionSpy).not.toHaveBeenCalled();
    });

    it('#mouseUp should reset resizeSelectionService to NO_POINT if it wasnt', () => {
        selectionTool.mouseDown = true;
        moveSelectionServiceSpyObj['movingWithMouse'] = false;
        resizeSelectionSpyObj['selectedPointIndex'] = SelectedPoint.TOP_LEFT;

        selectionTool.onMouseUp(mouseEvent);

        expect(resizeSelectionSpyObj['selectedPointIndex']).toEqual(SelectedPoint.NO_POINT);
    });

    it('#onKeyDown should cancel the selection if escape is pressed', () => {
        const cancelSelectionSpy = spyOn(selectionTool, 'cancelSelection');
        const escapeKeyEvent = { code: 'Escape' } as KeyboardEvent;
        selectionTool.onKeyDown(escapeKeyEvent);
        expect(cancelSelectionSpy).toHaveBeenCalled();
    });

    it('#onKeyDown should handle leftShift when its pressed', () => {
        selectionTool.selectionExists = false;
        const handleLeftShiftSpy = spyOn<any>(selectionTool, 'handleLeftShift');
        const leftShiftKeyEvent = { code: 'ShiftLeft' } as KeyboardEvent;

        selectionTool.onKeyDown(leftShiftKeyEvent);
        expect(handleLeftShiftSpy).toHaveBeenCalledWith(leftShiftKeyEvent, rectangleDrawingServiceSpyObj.onKeyDown);
    });

    it('#onKeyDown should handle the arrow keys if a selection exists', () => {
        selectionTool.selectionExists = true;
        const handleMovingArrowsKeyDownSpy = spyOn<any>(selectionTool, 'handleMovingArrowsKeyDown');
        selectionTool.onKeyDown({} as KeyboardEvent);
        expect(handleMovingArrowsKeyDownSpy).toHaveBeenCalled();
    });

    it('#onKeyUp should handle leftShift when its unpressed', () => {
        const handleLeftShiftSpy = spyOn<any>(selectionTool, 'handleLeftShift');
        const leftShiftKeyEvent = { code: 'ShiftLeft' } as KeyboardEvent;
        selectionTool.onKeyUp(leftShiftKeyEvent);
        expect(handleLeftShiftSpy).toHaveBeenCalledWith(leftShiftKeyEvent, rectangleDrawingServiceSpyObj.onKeyUp);
    });

    it('#onKeyUp should handle the arrow keys if a selection exists', () => {
        selectionTool.selectionExists = true;
        const handleMovingArrowsKeyUpSpy = spyOn<any>(selectionTool, 'handleMovingArrowsKeyUp');
        selectionTool.onKeyUp({} as KeyboardEvent);
        expect(handleMovingArrowsKeyUpSpy).toHaveBeenCalled();
    });

    it('#handleLeftShift should call the function given by parameter and redraw the perimeter, if selection doesnt exist', () => {
        selectionTool.selectionExists = false;
        const drawPerimeterSpy = spyOn(selectionTool, 'drawPerimeter');
        selectionTool['handleLeftShift']({} as KeyboardEvent, rectangleDrawingServiceSpyObj.onKeyDown);

        expect(rectangleDrawingServiceSpyObj.onKeyDown).toHaveBeenCalled();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(drawPerimeterSpy).toHaveBeenCalled();
    });

    it('#handleLeftShift should save the last dimensions in resizeSelectionService when pressed down, if selection exists', () => {
        selectionTool.selectionExists = true;
        selectionTool['coords'].finalTopLeft = TOP_LEFT_CORNER_COORDS;
        selectionTool['coords'].finalBottomRight = BOTTOM_RIGHT_CORNER_COORDS;
        resizeSelectionSpyObj.shiftKeyIsDown = false;

        selectionTool['handleLeftShift']({} as KeyboardEvent, rectangleDrawingServiceSpyObj.onKeyDown);
        expect(resizeSelectionSpyObj.shiftKeyIsDown).toBeTrue();
        expect(resizeSelectionSpyObj.lastDimensions).toEqual({ x: 40, y: 20 });
    });

    it('#handleLeftShift should set shiftKeyIsDown to false and resizeSelection, when shift key unpressed, if selection exists', () => {
        selectionTool.selectionExists = true;
        selectionTool['coords'].finalTopLeft = TOP_LEFT_CORNER_COORDS;
        selectionTool['coords'].finalBottomRight = BOTTOM_RIGHT_CORNER_COORDS;
        resizeSelectionSpyObj.shiftKeyIsDown = true;
        const resizeSelectionSpy = spyOn<any>(selectionTool, 'resizeSelection');

        selectionTool['handleLeftShift']({} as KeyboardEvent, rectangleDrawingServiceSpyObj.onKeyUp);
        expect(resizeSelectionSpyObj.shiftKeyIsDown).toBeFalse();
        expect(resizeSelectionSpy).toHaveBeenCalled();
    });

    it('#resizeSelection should call resizeSelection from resizeSelectionService and drawAll', () => {
        const drawAllSpy = spyOn<any>(selectionTool, 'drawAll');

        selectionTool['resizeSelection'](BOTTOM_RIGHT_CORNER_COORDS);
        expect(drawAllSpy).toHaveBeenCalled();
        expect(resizeSelectionSpyObj.resizeSelection).toHaveBeenCalled();
    });

    it('#handleMovingArrowsKeyDown should update the arrow keys pressed to true', () => {
        const arrowEvent = { code: 'ArrowUp' } as KeyboardEvent;

        selectionTool['handleMovingArrowsKeyDown'](arrowEvent);
        expect(moveSelectionServiceSpyObj.updateArrowKeysPressed).toHaveBeenCalledWith(arrowEvent, true);
    });

    it('#handleMovingArrowsKeyDown should handle the initial arrow timer if any arrow is pressed and not already moving with arrows', () => {
        moveSelectionServiceSpyObj['initialKeyPress'] = false;
        moveSelectionServiceSpyObj['movingWithArrows'] = false;
        moveSelectionServiceSpyObj.checkIfAnyArrowIsPressed.and.returnValue(true);
        const handleArrowInitialTimeSpy = spyOn<any>(selectionTool, 'handleArrowInitialTime');
        const arrowEvent = { code: 'ArrowUp' } as KeyboardEvent;

        selectionTool['handleMovingArrowsKeyDown'](arrowEvent);
        expect(moveSelectionServiceSpyObj.checkIfAnyArrowIsPressed).toHaveBeenCalled();
        expect(handleArrowInitialTimeSpy).toHaveBeenCalled();
    });

    it('#handleMovingArrowsKeyUp should update the arrow keys pressed to false', () => {
        const arrowEvent = { code: 'ArrowUp' } as KeyboardEvent;

        selectionTool['handleMovingArrowsKeyUp'](arrowEvent);
        expect(moveSelectionServiceSpyObj.updateArrowKeysPressed).toHaveBeenCalledWith(arrowEvent, false);
    });

    it('#handleMovingArrowsKeyUp should cancel the initial arrow timer and move the selection once by the calculated delta, when applicable', () => {
        moveSelectionServiceSpyObj['initialKeyPress'] = true;
        const arrowDelta = { x: 3, y: 3 };
        moveSelectionServiceSpyObj.calculateDelta.and.returnValue(arrowDelta);
        const clearTimeoutSpy = spyOn(window, 'clearTimeout');

        selectionTool['handleMovingArrowsKeyUp']({} as KeyboardEvent);
        expect(clearTimeoutSpy).toHaveBeenCalled();
        expect(selectionTool['timeoutHandler']).toEqual(0);
        expect(moveSelectionServiceSpyObj.calculateDelta).toHaveBeenCalled();
        expect(moveSelectionServiceSpyObj.moveSelectionWithArrows).toHaveBeenCalledWith(arrowDelta, selectionTool['coords']);
    });

    it('#handleMovingArrowsKeyUp should cancel the continuous arrow interval and set movingWithArrows to false, when applicable', () => {
        moveSelectionServiceSpyObj['initialKeyPress'] = false;
        const clearIntervalSpy = spyOn(window, 'clearInterval');

        selectionTool['handleMovingArrowsKeyUp']({} as KeyboardEvent);
        expect(clearIntervalSpy).toHaveBeenCalled();
        expect(selectionTool['intervalHandler']).toEqual(0);
        expect(moveSelectionServiceSpyObj.checkIfAnyArrowIsPressed).toHaveBeenCalled();
        expect(moveSelectionServiceSpyObj['movingWithArrows']).toBeFalse();
    });

    it('#handleMovingArrowsKeyUp should not cancel the continuous arrow interval if a key is still pressd', () => {
        moveSelectionServiceSpyObj['initialKeyPress'] = false;
        moveSelectionServiceSpyObj['movingWithArrows'] = true;
        moveSelectionServiceSpyObj.checkIfAnyArrowIsPressed.and.returnValue(true);
        const clearIntervalSpy = spyOn(window, 'clearInterval');

        selectionTool['handleMovingArrowsKeyUp']({} as KeyboardEvent);
        expect(clearIntervalSpy).not.toHaveBeenCalled();
        expect(moveSelectionServiceSpyObj.checkIfAnyArrowIsPressed).toHaveBeenCalled();
        expect(moveSelectionServiceSpyObj['movingWithArrows']).toBeTrue();
    });

    it('#handleArrowInitialTime should set initialKeyPress to true and start a timeout function', () => {
        moveSelectionServiceSpyObj['initialKeyPress'] = false;
        const startContinousArrowMovementSpy = spyOn<any>(selectionTool, 'startContinousArrowMovement');

        jasmine.clock().install();

        selectionTool['handleArrowInitialTime'](drawingServiceSpyObj.previewCtx, {} as KeyboardEvent);
        jasmine.clock().tick(selectionTool['INITIAL_ARROW_TIMER'] + 1);

        expect(moveSelectionServiceSpyObj['initialKeyPress']).toBeTrue();
        expect(startContinousArrowMovementSpy).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });

    it('#startContinousArrowMovement should set movingWithArrows to true and start an interval timer', () => {
        moveSelectionServiceSpyObj['initialKeyPress'] = true;
        jasmine.clock().install();

        selectionTool['startContinousArrowMovement'](drawingServiceSpyObj.previewCtx);
        jasmine.clock().tick(selectionTool['ARROW_INTERVAL'] + 1);

        expect(moveSelectionServiceSpyObj['initialKeyPress']).toBeFalse();
        expect(moveSelectionServiceSpyObj['movingWithArrows']).toBeTrue();
        expect(moveSelectionServiceSpyObj.moveSelectionWithArrows).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });

    it('#startContinousArrowMovement should not set movingWithArrows to true nor start an interval timer if initialKeyPress is false', () => {
        moveSelectionServiceSpyObj['initialKeyPress'] = false;
        const setIntervalSpy = spyOn(window, 'setInterval');
        moveSelectionServiceSpyObj.movingWithArrows = false;
        selectionTool['startContinousArrowMovement'](drawingServiceSpyObj.previewCtx);
        expect(moveSelectionServiceSpyObj.movingWithArrows).toBeFalse();
        expect(setIntervalSpy).not.toHaveBeenCalled();
    });

    it('#createSelection should save the selection, draw it on the preview canvas, set selectionExists to true', () => {
        selectionTool['coords'].initialTopLeft = TOP_LEFT_CORNER_COORDS;
        selectionTool['coords'].initialBottomRight = BOTTOM_RIGHT_CORNER_COORDS;
        selectionTool['selectionExists'] = false;
        const drawAllSpy = spyOn<any>(selectionTool, 'drawAll');
        const saveSelectionSpy = spyOn<any>(selectionTool, 'saveSelection');

        selectionTool['createSelection']();

        expect(drawAllSpy).toHaveBeenCalledWith(drawingServiceSpyObj.previewCtx);
        expect(saveSelectionSpy).toHaveBeenCalled();
        expect(selectionTool.selectionExists).toBeTrue();
    });

    it('#createSelection should not do anything if the selection width or height is zero', () => {
        selectionTool['coords'].initialTopLeft = TOP_LEFT_CORNER_COORDS;
        selectionTool['coords'].initialBottomRight = TOP_LEFT_CORNER_COORDS;
        selectionTool['selectionExists'] = false;
        const drawAllSpy = spyOn<any>(selectionTool, 'drawAll');
        const saveSelectionSpy = spyOn<any>(selectionTool, 'saveSelection');

        selectionTool['createSelection']();

        expect(drawAllSpy).not.toHaveBeenCalled();
        expect(saveSelectionSpy).not.toHaveBeenCalled();
        expect(undoRedoSpyObj.disableUndoRedo).not.toHaveBeenCalled();
        expect(selectionTool.selectionExists).toBeFalse();
    });

    it('#saveSelection should set the selection coords to the right values, save the image data in a variable and selected area with white', () => {
        selectionTool['coords'].initialTopLeft = TOP_LEFT_CORNER_COORDS;
        selectionTool['coords'].initialBottomRight = BOTTOM_RIGHT_CORNER_COORDS;

        const setSelectionCoordsSpy = spyOn<any>(selectionTool, 'setSelectionCoords');
        const fillWithWhiteSpy = spyOn(selectionTool, 'fillWithWhite');

        selectionTool['saveSelection'](drawingServiceSpyObj.baseCtx);
        expect(selectionTool['data']).toBeDefined();
        expect(fillWithWhiteSpy).toHaveBeenCalled();
        expect(setSelectionCoordsSpy).toHaveBeenCalled();
    });

    it('#setSelectionCoords should re-arrange the initial coords so that initialTopLeft is actually the top-leftmost point, etc.', () => {
        selectionTool['coords'].initialTopLeft = BOTTOM_RIGHT_CORNER_COORDS;
        selectionTool['coords'].initialBottomRight = TOP_LEFT_CORNER_COORDS;

        selectionTool['setSelectionCoords']();

        expect(selectionTool['coords'].initialTopLeft).toEqual(TOP_LEFT_CORNER_COORDS);
        expect(selectionTool['coords'].initialBottomRight).toEqual(BOTTOM_RIGHT_CORNER_COORDS);
    });

    it('#setSelectionCoords should set the final coords to the re-arranged initial coords', () => {
        selectionTool['coords'].initialTopLeft = BOTTOM_RIGHT_CORNER_COORDS;
        selectionTool['coords'].initialBottomRight = TOP_LEFT_CORNER_COORDS;

        selectionTool['setSelectionCoords']();

        expect(selectionTool['coords'].finalTopLeft).toEqual(TOP_LEFT_CORNER_COORDS);
        expect(selectionTool['coords'].finalBottomRight).toEqual(BOTTOM_RIGHT_CORNER_COORDS);
    });

    it('#adjustToDrawingBounds should adjust the initial coords so that they dont go outside the canvas, beyond the canvas dimensions', () => {
        const EXCESS_PIXELS = 5;
        selectionTool['coords'].initialTopLeft = TOP_LEFT_CORNER_COORDS;
        selectionTool['coords'].initialBottomRight = {
            x: drawingServiceSpyObj.canvas.width + EXCESS_PIXELS,
            y: drawingServiceSpyObj.canvas.height + EXCESS_PIXELS,
        };

        selectionTool['adjustToDrawingBounds']();

        expect(selectionTool['coords'].initialTopLeft).toEqual(TOP_LEFT_CORNER_COORDS);
        expect(selectionTool['coords'].initialBottomRight).toEqual({
            x: drawingServiceSpyObj.canvas.width,
            y: drawingServiceSpyObj.canvas.height,
        });
    });

    it('#adjustToDrawingBounds should adjust the initial coords so that they dont go outside the canvas, under zero', () => {
        const EXCESS_PIXELS = 5;

        selectionTool['coords'].initialTopLeft = BOTTOM_RIGHT_CORNER_COORDS;
        selectionTool['coords'].initialBottomRight = {
            x: -EXCESS_PIXELS,
            y: -EXCESS_PIXELS,
        };

        selectionTool['adjustToDrawingBounds']();

        expect(selectionTool['coords'].initialTopLeft).toEqual(BOTTOM_RIGHT_CORNER_COORDS);
        expect(selectionTool['coords'].initialBottomRight).toEqual(TOP_LEFT_CORNER_COORDS);
    });

    it('#cancelSelection should clear the canvas', () => {
        selectionTool.cancelSelection();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
    });

    it('#cancelSelection should set the initialTopLeft coords to the initialBottomRight, if there isnt a selection yet (escape key case)', () => {
        selectionTool['coords'].initialTopLeft = TOP_LEFT_CORNER_COORDS;
        selectionTool['coords'].initialBottomRight = BOTTOM_RIGHT_CORNER_COORDS;
        selectionTool.selectionExists = false;

        selectionTool.cancelSelection();

        expect(selectionTool['coords'].initialTopLeft).toEqual(BOTTOM_RIGHT_CORNER_COORDS);
    });

    it('#cancelSelection should draw the selection on the base context, reset values and enable undo-redo if selection exists', () => {
        selectionTool['coords'].initialTopLeft = TOP_LEFT_CORNER_COORDS;
        selectionTool['coords'].initialBottomRight = BOTTOM_RIGHT_CORNER_COORDS;

        selectionTool.selectionExists = true;
        const drawSpy = spyOn<any>(selectionTool, 'draw');
        const clearIntervalSpy = spyOn<any>(window, 'clearInterval');

        selectionTool.cancelSelection();

        expect(selectionTool['coords'].initialTopLeft).toEqual(TOP_LEFT_CORNER_COORDS);
        expect(selectionTool['coords'].initialBottomRight).toEqual(TOP_LEFT_CORNER_COORDS);
        expect(drawSpy).toHaveBeenCalledWith(drawingServiceSpyObj.baseCtx);
        expect(selectionTool.selectionExists).toBeFalse();
        expect(moveSelectionServiceSpyObj.movingWithMouse).toBeFalse();
        expect(moveSelectionServiceSpyObj['movingWithArrows']).toBeFalse();
        expect(selectionTool['intervalHandler']).toEqual(0);
        expect(undoRedoSpyObj.enableUndoRedo).toHaveBeenCalled();
        expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('#cancelSelection should not do anything if context isnt initialized yet', () => {
        drawingServiceSpyObj.previewCtx = (undefined as unknown) as CanvasRenderingContext2D;
        const drawSpy = spyOn<any>(selectionTool, 'draw');

        selectionTool.cancelSelection();

        expect(drawSpy).not.toHaveBeenCalled();
        expect(drawingServiceSpyObj.clearCanvas).not.toHaveBeenCalled();
    });

    it('#drawAll should draw the selection, draw the perimeter and draw the box', () => {
        const drawSpy = spyOn<any>(selectionTool, 'draw');
        const drawPerimeterSpy = spyOn(selectionTool, 'drawPerimeter');

        selectionTool['drawAll'](drawingServiceSpyObj.previewCtx);

        expect(drawSpy).toHaveBeenCalled();
        expect(drawPerimeterSpy).toHaveBeenCalled();
        expect(resizeSelectionSpyObj.drawBox).toHaveBeenCalled();
    });

    it('#draw should make a new selection command using #loadUpProperties as parameter', () => {
        const loadUpPropertiesSpy = spyOn<any>(selectionTool, 'loadUpProperties');
        selectionTool['draw'](drawingServiceSpyObj.previewCtx);
        expect(loadUpPropertiesSpy).toHaveBeenCalled();
    });

    it('#draw should add a command to the undo-redo list if the initial coords are different to the final coords, and ctx is baseCtx', () => {
        selectionTool['coords'].initialTopLeft = TOP_LEFT_CORNER_COORDS;
        selectionTool['coords'].initialBottomRight = BOTTOM_RIGHT_CORNER_COORDS;
        selectionTool['coords'].finalTopLeft = {
            x: TOP_LEFT_CORNER_COORDS.x + MOUSE_POSITION.x,
            y: TOP_LEFT_CORNER_COORDS.y + MOUSE_POSITION.y,
        };
        selectionTool['coords'].finalBottomRight = {
            x: BOTTOM_RIGHT_CORNER_COORDS.x + MOUSE_POSITION.x,
            y: BOTTOM_RIGHT_CORNER_COORDS.y + MOUSE_POSITION.y,
        };
        selectionTool['draw'](drawingServiceSpyObj.baseCtx);
        expect(undoRedoSpyObj.addCommand).toHaveBeenCalled();
    });

    it('#draw should not add a command to the undo-redo list if the initial coords the same as the final coords', () => {
        selectionTool['coords'].initialTopLeft = TOP_LEFT_CORNER_COORDS;
        selectionTool['coords'].initialBottomRight = BOTTOM_RIGHT_CORNER_COORDS;
        selectionTool['coords'].finalTopLeft = TOP_LEFT_CORNER_COORDS;
        selectionTool['coords'].finalBottomRight = BOTTOM_RIGHT_CORNER_COORDS;

        selectionTool['draw'](drawingServiceSpyObj.baseCtx);
        expect(undoRedoSpyObj.addCommand).not.toHaveBeenCalled();
    });

    it('#selectAll should execute a mouseDown followed by a mouseUp to simulate the user selecting the whole canvas', () => {
        const onMouseDownSpy = spyOn(selectionTool, 'onMouseDown');
        const onMouseUpSpy = spyOn(selectionTool, 'onMouseUp');

        selectionTool.selectAll();

        expect(onMouseDownSpy).toHaveBeenCalled();
        expect(onMouseUpSpy).toHaveBeenCalled();
    });

    it('#isInsideSelection should return true if given point is inside the selection bounds, and false otherwise', () => {
        selectionTool['coords'].finalTopLeft = TOP_LEFT_CORNER_COORDS;
        selectionTool['coords'].finalBottomRight = BOTTOM_RIGHT_CORNER_COORDS;

        expect(selectionTool['isInsideSelection']({ x: 5, y: 5 })).toBeTrue();
        expect(selectionTool['isInsideSelection']({ x: 30, y: 10 })).toBeTrue();
        expect(selectionTool['isInsideSelection']({ x: 60, y: 10 })).toBeFalse();
        expect(selectionTool['isInsideSelection']({ x: 20, y: 25 })).toBeTrue();
        expect(selectionTool['isInsideSelection']({ x: 50, y: 50 })).toBeFalse();
    });

    it('#setOffset should set the mouseMoveOffset to the difference between the given position and the top left corner', () => {
        selectionTool['coords'].finalTopLeft = BOTTOM_RIGHT_CORNER_COORDS;

        selectionTool['setOffSet']({ x: BOTTOM_RIGHT_CORNER_COORDS.x + MOUSE_OFFSET, y: BOTTOM_RIGHT_CORNER_COORDS.y + MOUSE_OFFSET });

        expect(moveSelectionServiceSpyObj.mouseMoveOffset).toEqual({ x: MOUSE_OFFSET, y: MOUSE_OFFSET });
    });

    it('#loadUpProperties should create a SelectionProperties object with the right properties', () => {
        const TEST_DATA = drawingServiceSpyObj.previewCtx.getImageData(
            TOP_LEFT_CORNER_COORDS.x,
            TOP_LEFT_CORNER_COORDS.y,
            BOTTOM_RIGHT_CORNER_COORDS.x,
            BOTTOM_RIGHT_CORNER_COORDS.y,
        );
        selectionTool['data'] = TEST_DATA;
        selectionTool['coords'].initialTopLeft = TOP_LEFT_CORNER_COORDS;
        selectionTool['coords'].initialBottomRight = BOTTOM_RIGHT_CORNER_COORDS;
        selectionTool['coords'].finalTopLeft = TOP_LEFT_CORNER_COORDS;
        selectionTool['coords'].finalBottomRight = BOTTOM_RIGHT_CORNER_COORDS;

        const selectionProperties = selectionTool['loadUpProperties'](drawingServiceSpyObj.previewCtx);

        expect(selectionProperties.selectionCtx).toEqual(drawingServiceSpyObj.previewCtx);
        expect(selectionProperties.imageData).toEqual(TEST_DATA);
        expect(selectionProperties.coords.initialTopLeft).toEqual(TOP_LEFT_CORNER_COORDS);
        expect(selectionProperties.coords.initialBottomRight).toEqual(BOTTOM_RIGHT_CORNER_COORDS);
        expect(selectionProperties.coords.finalTopLeft).toEqual(TOP_LEFT_CORNER_COORDS);
        expect(selectionProperties.coords.finalBottomRight).toEqual(BOTTOM_RIGHT_CORNER_COORDS);
    });

    it('#scaleContext should perform a scale matrix on context with the ratio : final size / begin size', () => {
        const coords: SelectionCoords = {
            initialTopLeft: TOP_LEFT_CORNER_COORDS,
            initialBottomRight: BOTTOM_RIGHT_CORNER_COORDS,
            finalTopLeft: TOP_LEFT_CORNER_COORDS,
            finalBottomRight: { x: BOTTOM_RIGHT_CORNER_COORDS.x * 2, y: BOTTOM_RIGHT_CORNER_COORDS.y * 2 },
        };
        const scaleSpy = spyOn<any>(drawingServiceSpyObj.baseCtx, 'scale');
        const translateSpy = spyOn<any>(drawingServiceSpyObj.baseCtx, 'translate');

        selectionTool['scaleContext'](coords, drawingServiceSpyObj.baseCtx);
        expect(scaleSpy).toHaveBeenCalledWith(2, 2);
        expect(translateSpy).toHaveBeenCalledTimes(2);
    });

    // tslint:disable-next-line: max-file-line-count
});
