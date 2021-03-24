import { TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { CanvasTestHelper } from './canvas-test-helper';
import { SelectionPropreties } from './commands/selection-command/selection-command';
import { SelectionTool } from './selection-tool';
import { HORIZONTAL_OFFSET, MouseButton, VERTICAL_OFFSET } from './tool';
import { Vec2 } from './vec2';

export class SelectionToolStub extends SelectionTool {
    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        return;
    }
    drawSelection(selectionPropreties: SelectionPropreties): void {
        return;
    }
    fillWithWhite(selectionPropreties: SelectionPropreties): void {
        return;
    }
    constructor(drawingService: DrawingService, rectangleDrawingService: RectangleDrawingService, undoRedoService: UndoRedoService) {
        super(drawingService, rectangleDrawingService, 'Stub', undoRedoService);
    }
}
// tslint:disable: no-any
// tslint:disable: no-string-literal
describe('SelectionTool', () => {
    let selectionTool: SelectionTool;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let rectangleDrawingServiceSpyObj: jasmine.SpyObj<RectangleDrawingService>;
    let undoRedoSpyObj: jasmine.SpyObj<UndoRedoService>;
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
    const RGB_MAX = 255;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        rectangleDrawingServiceSpyObj = jasmine.createSpyObj('RectangleDrawingService', ['getTrueEndCoords', 'onKeyUp', 'onKeyDown']);
        undoRedoSpyObj = jasmine.createSpyObj('UndoRedoService', ['disableUndoRedo', 'enableUndoRedo', 'addCommand']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: RectangleDrawingService, useValue: rectangleDrawingServiceSpyObj },
                { provide: UndoRedoService, useValue: undoRedoSpyObj },
            ],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpyObj.canvas = canvasTestHelper.canvas;

        selectionTool = new SelectionToolStub(drawingServiceSpyObj, rectangleDrawingServiceSpyObj, undoRedoSpyObj);

        selectionTool['drawingService'].baseCtx = baseCtxStub;
        selectionTool['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            pageX: MOUSE_POSITION.x + HORIZONTAL_OFFSET,
            pageY: MOUSE_POSITION.y + VERTICAL_OFFSET,
            button: MouseButton.Left,
            buttons: LEFT_BUTTON_PRESSED,
        } as MouseEvent;
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
        expect(selectionTool['initialTopLeft']).toEqual(MOUSE_POSITION);
        expect(selectionTool['initialBottomRight']).toEqual(MOUSE_POSITION);
        expect(undoRedoSpyObj.disableUndoRedo).toHaveBeenCalled();
    });

    it('#onMouseDown should cancelSelection if clicked outside of selection', () => {
        selectionTool.selectionExists = true;
        const isInsideSelectionSpy = spyOn<any>(selectionTool, 'isInsideSelection').and.returnValue(false);
        const cancelSelectionSpy = spyOn(selectionTool, 'cancelSelection');

        selectionTool.onMouseDown(mouseEvent);
        expect(isInsideSelectionSpy).toHaveBeenCalled();
        expect(cancelSelectionSpy).toHaveBeenCalled();
    });

    it('#onMouseDown should set movingWithMouse to true and shoud set a mouseOffset if clicked inside a selection', () => {
        selectionTool.selectionExists = true;
        const isInsideSelectionSpy = spyOn<any>(selectionTool, 'isInsideSelection').and.returnValue(true);
        const setOffsetSpy = spyOn<any>(selectionTool, 'setOffSet');

        selectionTool.onMouseDown(mouseEvent);
        expect(selectionTool['movingWithMouse']).toBeTrue();
        expect(isInsideSelectionSpy).toHaveBeenCalled();

        expect(setOffsetSpy).toHaveBeenCalled();
    });

    it('#onMouseMove should set mouseDown to false if not moving with left mouse button pressed (edge case)', () => {
        selectionTool.mouseDown = true;
        const mouseEventMove = {
            pageX: MOUSE_POSITION.x + HORIZONTAL_OFFSET,
            pageY: MOUSE_POSITION.y + VERTICAL_OFFSET,
            buttons: NO_BUTTON_PRESSED,
        } as MouseEvent;
        selectionTool.onMouseMove(mouseEventMove);
        expect(selectionTool.mouseDown).toBeFalse();
    });

    it('#onMouseMove should set initialBottomRight coordinate and draw a perimeter box bounded by canvas when not moving a selection', () => {
        selectionTool.mouseDown = true;
        selectionTool['movingWithMouse'] = false;
        const adjustToDrawingBoundsSpy = spyOn<any>(selectionTool, 'adjustToDrawingBounds');
        const drawPerimeterSpy = spyOn(selectionTool, 'drawPerimeter');

        selectionTool.onMouseMove(mouseEvent);

        expect(selectionTool['initialBottomRight']).toEqual(MOUSE_POSITION);
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(adjustToDrawingBoundsSpy).toHaveBeenCalled();
        expect(drawPerimeterSpy).toHaveBeenCalled();
    });

    it('#onMouseMove should call #moveSelectionWithMouse if moving a selection', () => {
        selectionTool.mouseDown = true;
        selectionTool['movingWithMouse'] = true;
        const moveSelectionWithMouseSpy = spyOn<any>(selectionTool, 'moveSelectionWithMouse');

        selectionTool.onMouseMove(mouseEvent);
        expect(moveSelectionWithMouseSpy).toHaveBeenCalled();
    });

    it('#onMouseUp should set mouseDown and/or movingWithMouse to false', () => {
        selectionTool.mouseDown = true;
        selectionTool['movingWithMouse'] = true;
        selectionTool.onMouseUp(mouseEvent);
        expect(selectionTool.mouseDown).toBeFalse();
        expect(selectionTool['movingWithMouse']).toBeFalse();
    });

    it('#onMouseUp should set initialBottomRight to the correct coords and create a selection, when not moving a selection', () => {
        selectionTool.mouseDown = true;
        selectionTool['movingWithMouse'] = false;
        const mouseEventUp = {
            pageX: BOTTOM_RIGHT_CORNER_COORDS.x + HORIZONTAL_OFFSET,
            pageY: BOTTOM_RIGHT_CORNER_COORDS.y + VERTICAL_OFFSET,
        } as MouseEvent;
        const trueEndCoords = { x: 20, y: 20 };
        rectangleDrawingServiceSpyObj.alternateShape = true;
        rectangleDrawingServiceSpyObj.getTrueEndCoords.and.returnValue(trueEndCoords);
        const adjustToDrawingBoundsSpy = spyOn<any>(selectionTool, 'adjustToDrawingBounds');
        const createSelectionSpy = spyOn<any>(selectionTool, 'createSelection');

        selectionTool.onMouseUp(mouseEventUp);

        expect(selectionTool['initialBottomRight']).toEqual(trueEndCoords);
        expect(adjustToDrawingBoundsSpy).toHaveBeenCalled();
        expect(rectangleDrawingServiceSpyObj.getTrueEndCoords).toHaveBeenCalled();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(createSelectionSpy).toHaveBeenCalled();
        expect(rectangleDrawingServiceSpyObj.alternateShape).toBeFalse();
    });

    it('#mouseUp shouldnt do anything if mouseDown is false', () => {
        selectionTool.mouseDown = false;
        selectionTool['movingWithMouse'] = false;
        const createSelectionSpy = spyOn<any>(selectionTool, 'createSelection');

        selectionTool.onMouseUp(mouseEvent);

        expect(rectangleDrawingServiceSpyObj.getTrueEndCoords).not.toHaveBeenCalled();
        expect(drawingServiceSpyObj.clearCanvas).not.toHaveBeenCalled();
        expect(createSelectionSpy).not.toHaveBeenCalled();
    });

    it('#onKeyDown should cancel the selection if escape is pressed', () => {
        const cancelSelectionSpy = spyOn(selectionTool, 'cancelSelection');
        const escapeKeyEvent = {
            code: 'Escape',
        } as KeyboardEvent;
        selectionTool.onKeyDown(escapeKeyEvent);
        expect(cancelSelectionSpy).toHaveBeenCalled();
    });

    it('#onKeyDown should handle leftShift when its pressed if there isnt an active selection yet', () => {
        selectionTool.selectionExists = false;
        const handleLeftShiftSpy = spyOn<any>(selectionTool, 'handleLeftShift');
        const leftShiftKeyEvent = { code: 'ShiftLeft' } as KeyboardEvent;

        selectionTool.onKeyDown(leftShiftKeyEvent);
        expect(handleLeftShiftSpy).toHaveBeenCalledWith(leftShiftKeyEvent, rectangleDrawingServiceSpyObj.onKeyDown);
    });

    it('#onKeyDown should not handle leftShift when its pressed if there already is an active selection', () => {
        selectionTool.selectionExists = true;
        const handleLeftShiftSpy = spyOn<any>(selectionTool, 'handleLeftShift');
        const leftShiftKeyEvent = { code: 'ShiftLeft' } as KeyboardEvent;

        selectionTool.onKeyDown(leftShiftKeyEvent);
        expect(handleLeftShiftSpy).not.toHaveBeenCalled();
    });

    it('#onKeyDown should handle the arrow keys if a selection exists', () => {
        selectionTool.selectionExists = true;
        const handleMovingArrowsKeyDownSpy = spyOn<any>(selectionTool, 'handleMovingArrowsKeyDown');
        selectionTool.onKeyDown({} as KeyboardEvent);
        expect(handleMovingArrowsKeyDownSpy).toHaveBeenCalled();
    });

    it('#onKeyUp should handle leftShift when its unpressed if there isnt an active selection yet', () => {
        selectionTool.selectionExists = false;
        const handleLeftShiftSpy = spyOn<any>(selectionTool, 'handleLeftShift');
        const leftShiftKeyEvent = { code: 'ShiftLeft' } as KeyboardEvent;
        selectionTool.onKeyUp(leftShiftKeyEvent);
        expect(handleLeftShiftSpy).toHaveBeenCalledWith(leftShiftKeyEvent, rectangleDrawingServiceSpyObj.onKeyUp);
    });

    it('#onKeyUp should not handle leftShift when its unpressed if there already is an active selection', () => {
        selectionTool.selectionExists = true;
        const handleLeftShiftSpy = spyOn<any>(selectionTool, 'handleLeftShift');
        const leftShiftKeyEvent = { code: 'ShiftLeft' } as KeyboardEvent;

        selectionTool.onKeyUp(leftShiftKeyEvent);
        expect(handleLeftShiftSpy).not.toHaveBeenCalled();
    });

    it('#onKeyUp should handle the arrow keys if a selection exists', () => {
        selectionTool.selectionExists = true;
        const handleMovingArrowsKeyUpSpy = spyOn<any>(selectionTool, 'handleMovingArrowsKeyUp');
        selectionTool.onKeyUp({} as KeyboardEvent);
        expect(handleMovingArrowsKeyUpSpy).toHaveBeenCalled();
    });

    it('#handleLeftShift should call the function given by parameter and redraw the perimeter', () => {
        const drawPerimeterSpy = spyOn(selectionTool, 'drawPerimeter');
        selectionTool['handleLeftShift']({} as KeyboardEvent, rectangleDrawingServiceSpyObj.onKeyDown);

        expect(rectangleDrawingServiceSpyObj.onKeyDown).toHaveBeenCalled();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(drawPerimeterSpy).toHaveBeenCalled();
    });

    it('#handleMovingArrowsKeyDown should update the arrow keys pressed to true', () => {
        const updateArrowKeysPressedSpy = spyOn<any>(selectionTool, 'updateArrowKeysPressed');
        const arrowEvent = { code: 'ArrowUp' } as KeyboardEvent;

        selectionTool['handleMovingArrowsKeyDown'](arrowEvent);
        expect(updateArrowKeysPressedSpy).toHaveBeenCalledWith(arrowEvent, true);
    });

    it('#handleMovingArrowsKeyDown should handle the initial arrow timer if any arrow is pressed and not already moving with arrows', () => {
        selectionTool['initialKeyPress'] = false;
        selectionTool['movingWithArrows'] = false;
        const checkIfAnyArrowIsPressedSpy = spyOn<any>(selectionTool, 'checkIfAnyArrowIsPressed').and.returnValue(true);
        const handleArrowInitialTimeSpy = spyOn<any>(selectionTool, 'handleArrowInitialTime');
        const arrowEvent = { code: 'ArrowUp' } as KeyboardEvent;

        selectionTool['handleMovingArrowsKeyDown'](arrowEvent);
        expect(checkIfAnyArrowIsPressedSpy).toHaveBeenCalled();
        expect(handleArrowInitialTimeSpy).toHaveBeenCalled();
    });

    it('#handleMovingArrowsKeyUp should update the arrow keys pressed to false', () => {
        const updateArrowKeysPressedSpy = spyOn<any>(selectionTool, 'updateArrowKeysPressed');
        const arrowEvent = { code: 'ArrowUp' } as KeyboardEvent;

        selectionTool['handleMovingArrowsKeyUp'](arrowEvent);
        expect(updateArrowKeysPressedSpy).toHaveBeenCalledWith(arrowEvent, false);
    });

    it('#handleMovingArrowsKeyUp should cancel the initial arrow timer and move the selection once by the calculated delta, when applicable', () => {
        selectionTool['initialKeyPress'] = true;
        const arrowDelta = { x: 3, y: 3 };
        const calculateDeltaSpy = spyOn<any>(selectionTool, 'calculateDelta').and.returnValue(arrowDelta);
        const moveSelectionWithArrowsSpy = spyOn<any>(selectionTool, 'moveSelectionWithArrows');
        const clearTimeoutSpy = spyOn(window, 'clearTimeout');

        selectionTool['handleMovingArrowsKeyUp']({} as KeyboardEvent);
        expect(clearTimeoutSpy).toHaveBeenCalled();
        expect(selectionTool['timeoutHandler']).toEqual(0);
        expect(calculateDeltaSpy).toHaveBeenCalled();
        expect(moveSelectionWithArrowsSpy).toHaveBeenCalledWith(drawingServiceSpyObj.previewCtx, arrowDelta);
    });

    it('#handleMovingArrowsKeyUp should cancel the continuous arrow interval and set movingWithArrows to false, when applicable', () => {
        selectionTool['initialKeyPress'] = false;
        const checkIfAnyArrowIsPressedSpy = spyOn<any>(selectionTool, 'checkIfAnyArrowIsPressed').and.returnValue(false);
        const clearIntervalSpy = spyOn(window, 'clearInterval');

        selectionTool['handleMovingArrowsKeyUp']({} as KeyboardEvent);
        expect(clearIntervalSpy).toHaveBeenCalled();
        expect(selectionTool['intervalHandler']).toEqual(0);
        expect(checkIfAnyArrowIsPressedSpy).toHaveBeenCalled();
        expect(selectionTool['movingWithArrows']).toBeFalse();
    });

    it('#handleMovingArrowsKeyUp should not cancel the continuous arrow interval if a key is still pressd', () => {
        selectionTool['initialKeyPress'] = false;
        selectionTool['movingWithArrows'] = true;
        const checkIfAnyArrowIsPressedSpy = spyOn<any>(selectionTool, 'checkIfAnyArrowIsPressed').and.returnValue(true);
        const clearIntervalSpy = spyOn(window, 'clearInterval');

        selectionTool['handleMovingArrowsKeyUp']({} as KeyboardEvent);
        expect(clearIntervalSpy).not.toHaveBeenCalled();
        expect(checkIfAnyArrowIsPressedSpy).toHaveBeenCalled();
        expect(selectionTool['movingWithArrows']).toBeTrue();
    });

    it('#handleArrowInitialTime should set initialKeyPress to true and start a timeout function', () => {
        selectionTool['initialKeyPress'] = false;
        const startContinousArrowMovementSpy = spyOn<any>(selectionTool, 'startContinousArrowMovement');

        jasmine.clock().install();

        selectionTool['handleArrowInitialTime'](drawingServiceSpyObj.previewCtx, {} as KeyboardEvent);
        jasmine.clock().tick(selectionTool['INITIAL_ARROW_TIMER'] + 1);

        expect(selectionTool['initialKeyPress']).toBeTrue();
        expect(startContinousArrowMovementSpy).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });

    it('#startContinousArrowMovement should set movingWithArrows to true and start an interval timer', () => {
        selectionTool['initialKeyPress'] = true;
        const moveSelectionWithArrowsSpy = spyOn<any>(selectionTool, 'moveSelectionWithArrows');

        jasmine.clock().install();

        selectionTool['startContinousArrowMovement'](drawingServiceSpyObj.previewCtx);
        jasmine.clock().tick(selectionTool['ARROW_INTERVAL'] + 1);

        expect(selectionTool['initialKeyPress']).toBeFalse();
        expect(selectionTool['movingWithArrows']).toBeTrue();
        expect(moveSelectionWithArrowsSpy).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });

    it('#startContinousArrowMovement should not set movingWithArrows to true nor start an interval timer if initialKeyPress is false', () => {
        selectionTool['initialKeyPress'] = false;
        const setIntervalSpy = spyOn(window, 'setInterval');

        selectionTool['startContinousArrowMovement'](drawingServiceSpyObj.previewCtx);
        expect(selectionTool['movingWithArrows']).toBeFalse();
        expect(setIntervalSpy).not.toHaveBeenCalled();
    });

    it('#calculateDelta should calculate by how much the selection should move based on every arrow key condition', () => {
        selectionTool['keyDownIsPressed'] = true;
        selectionTool['keyLeftIsPressed'] = true;

        const calculatedDelta = selectionTool['calculateDelta']();

        expect(calculatedDelta).toEqual({ x: -selectionTool.arrowMoveDelta, y: selectionTool.arrowMoveDelta });
    });

    it('#calculateDelta should return 0,0 if everykey is pressed', () => {
        selectionTool['keyDownIsPressed'] = true;
        selectionTool['keyLeftIsPressed'] = true;
        selectionTool['keyRightIsPressed'] = true;
        selectionTool['keyUpIsPressed'] = true;

        const calculatedDelta = selectionTool['calculateDelta']();

        expect(calculatedDelta).toEqual({ x: 0, y: 0 });
    });

    it('#checkIfAnyArrowIsPressed should return true if any of the arrow press booleans are true', () => {
        selectionTool['keyUpIsPressed'] = true;
        const anyArrowPressed = selectionTool['checkIfAnyArrowIsPressed']();
        expect(anyArrowPressed).toBeTrue();
    });

    it('#updateArrowKeysPressed should change the arrow press boolean related to the KeyboardEvent to true, and not affect the others, when applicable', () => {
        selectionTool['keyDownIsPressed'] = false;
        selectionTool['keyUpIsPressed'] = true;
        selectionTool['keyLeftIsPressed'] = false;
        selectionTool['keyRightIsPressed'] = true;
        const arrowEvent = { code: 'ArrowLeft' } as KeyboardEvent;

        selectionTool['updateArrowKeysPressed'](arrowEvent, true);

        expect(selectionTool['keyDownIsPressed']).toBeFalse();
        expect(selectionTool['keyUpIsPressed']).toBeTrue();
        expect(selectionTool['keyLeftIsPressed']).toBeTrue();
        expect(selectionTool['keyRightIsPressed']).toBeTrue();
    });

    it('#updateArrowKeysPressed should change every arrowPress boolean to the given parameter if all keys are pressed in sucession', () => {
        selectionTool['keyDownIsPressed'] = false;
        selectionTool['keyUpIsPressed'] = false;
        selectionTool['keyLeftIsPressed'] = false;
        selectionTool['keyRightIsPressed'] = false;

        selectionTool['updateArrowKeysPressed']({ code: 'ArrowLeft' } as KeyboardEvent, true);
        selectionTool['updateArrowKeysPressed']({ code: 'ArrowUp' } as KeyboardEvent, true);
        selectionTool['updateArrowKeysPressed']({ code: 'ArrowDown' } as KeyboardEvent, true);
        selectionTool['updateArrowKeysPressed']({ code: 'ArrowRight' } as KeyboardEvent, true);

        expect(selectionTool['keyDownIsPressed']).toBeTrue();
        expect(selectionTool['keyUpIsPressed']).toBeTrue();
        expect(selectionTool['keyLeftIsPressed']).toBeTrue();
        expect(selectionTool['keyRightIsPressed']).toBeTrue();
    });

    it('#updateArrowKeysPressed should change the arrow press boolean related to the KeyboardEvent to false, and not affect the others, when applicable', () => {
        selectionTool['keyDownIsPressed'] = false;
        selectionTool['keyUpIsPressed'] = true;
        selectionTool['keyLeftIsPressed'] = false;
        selectionTool['keyRightIsPressed'] = true;
        const arrowEvent = { code: 'ArrowUp' } as KeyboardEvent;

        selectionTool['updateArrowKeysPressed'](arrowEvent, false);

        expect(selectionTool['keyDownIsPressed']).toBeFalse();
        expect(selectionTool['keyUpIsPressed']).toBeFalse();
        expect(selectionTool['keyLeftIsPressed']).toBeFalse();
        expect(selectionTool['keyRightIsPressed']).toBeTrue();
    });

    it('#moveSelectionWithArrows should move the selection coordinates by the given delta and redraw selection at the new position', () => {
        selectionTool['finalTopLeft'] = { x: TOP_LEFT_CORNER_COORDS.x, y: TOP_LEFT_CORNER_COORDS.y };
        selectionTool['finalBottomRight'] = { x: BOTTOM_RIGHT_CORNER_COORDS.x, y: BOTTOM_RIGHT_CORNER_COORDS.y };
        const drawAllSpy = spyOn<any>(selectionTool, 'drawAll');

        selectionTool['moveSelectionWithArrows'](drawingServiceSpyObj.previewCtx, {
            x: selectionTool.arrowMoveDelta,
            y: selectionTool.arrowMoveDelta,
        });
        expect(selectionTool['finalTopLeft']).toEqual({
            x: TOP_LEFT_CORNER_COORDS.x + selectionTool.arrowMoveDelta,
            y: TOP_LEFT_CORNER_COORDS.y + selectionTool.arrowMoveDelta,
        });
        expect(selectionTool['finalBottomRight']).toEqual({
            x: BOTTOM_RIGHT_CORNER_COORDS.x + selectionTool.arrowMoveDelta,
            y: BOTTOM_RIGHT_CORNER_COORDS.y + selectionTool.arrowMoveDelta,
        });
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(drawAllSpy).toHaveBeenCalledWith(drawingServiceSpyObj.previewCtx);
    });

    it('#moveSelectionWithMouse should move the selection coordinates to the given position minus the mouseOffset, and redraw the selection', () => {
        selectionTool['initialTopLeft'] = TOP_LEFT_CORNER_COORDS;
        selectionTool['initialBottomRight'] = BOTTOM_RIGHT_CORNER_COORDS;
        selectionTool['finalTopLeft'] = TOP_LEFT_CORNER_COORDS;
        selectionTool['finalBottomRight'] = BOTTOM_RIGHT_CORNER_COORDS;
        selectionTool['mouseMoveOffset'] = { x: MOUSE_OFFSET, y: MOUSE_OFFSET };
        const selectionWidth = BOTTOM_RIGHT_CORNER_COORDS.x - TOP_LEFT_CORNER_COORDS.x;
        const selectionHeight = BOTTOM_RIGHT_CORNER_COORDS.y - TOP_LEFT_CORNER_COORDS.y;
        const drawAllSpy = spyOn<any>(selectionTool, 'drawAll');

        selectionTool['moveSelectionWithMouse'](drawingServiceSpyObj.previewCtx, MOUSE_POSITION);
        expect(selectionTool['finalTopLeft']).toEqual({
            x: MOUSE_POSITION.x - MOUSE_OFFSET,
            y: MOUSE_POSITION.y - MOUSE_OFFSET,
        });
        expect(selectionTool['finalBottomRight']).toEqual({
            x: MOUSE_POSITION.x - MOUSE_OFFSET + selectionWidth,
            y: MOUSE_POSITION.y - MOUSE_OFFSET + selectionHeight,
        });
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(drawAllSpy).toHaveBeenCalledWith(drawingServiceSpyObj.previewCtx);
    });

    it('#createSelection should save the selection, draw it on the preview canvas, set selectionExists to true', () => {
        selectionTool['initialTopLeft'] = TOP_LEFT_CORNER_COORDS;
        selectionTool['initialBottomRight'] = BOTTOM_RIGHT_CORNER_COORDS;
        selectionTool['selectionExists'] = false;
        const drawAllSpy = spyOn<any>(selectionTool, 'drawAll');
        const saveSelectionSpy = spyOn<any>(selectionTool, 'saveSelection');

        selectionTool['createSelection']();

        expect(drawAllSpy).toHaveBeenCalledWith(drawingServiceSpyObj.previewCtx);
        expect(saveSelectionSpy).toHaveBeenCalled();
        expect(selectionTool.selectionExists).toBeTrue();
    });

    it('#createSelection should not do anything if the selection width or height is zero', () => {
        selectionTool['initialTopLeft'] = TOP_LEFT_CORNER_COORDS;
        selectionTool['initialBottomRight'] = TOP_LEFT_CORNER_COORDS;
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
        selectionTool['initialTopLeft'] = TOP_LEFT_CORNER_COORDS;
        selectionTool['initialBottomRight'] = BOTTOM_RIGHT_CORNER_COORDS;

        const setSelectionCoordsSpy = spyOn<any>(selectionTool, 'setSelectionCoords');
        const fillWithWhiteSpy = spyOn(selectionTool, 'fillWithWhite');

        selectionTool['saveSelection'](drawingServiceSpyObj.baseCtx);
        expect(selectionTool['data']).toBeDefined();
        expect(fillWithWhiteSpy).toHaveBeenCalled();
        expect(setSelectionCoordsSpy).toHaveBeenCalled();
    });

    it('#setSelectionCoords should re-arrange the initial coords so that initialTopLeft is actually the top-leftmost point, etc.', () => {
        selectionTool['initialTopLeft'] = BOTTOM_RIGHT_CORNER_COORDS;
        selectionTool['initialBottomRight'] = TOP_LEFT_CORNER_COORDS;

        selectionTool['setSelectionCoords']();

        expect(selectionTool['initialTopLeft']).toEqual(TOP_LEFT_CORNER_COORDS);
        expect(selectionTool['initialBottomRight']).toEqual(BOTTOM_RIGHT_CORNER_COORDS);
    });

    it('#setSelectionCoords should set the final coords to the re-arranged initial coords', () => {
        selectionTool['initialTopLeft'] = BOTTOM_RIGHT_CORNER_COORDS;
        selectionTool['initialBottomRight'] = TOP_LEFT_CORNER_COORDS;

        selectionTool['setSelectionCoords']();

        expect(selectionTool['finalTopLeft']).toEqual(TOP_LEFT_CORNER_COORDS);
        expect(selectionTool['finalBottomRight']).toEqual(BOTTOM_RIGHT_CORNER_COORDS);
    });

    it('#adjustToDrawingBounds should adjust the initial coords so that they dont go outside the canvas, beyond the canvas dimensions', () => {
        const EXCESS_PIXELS = 5;
        selectionTool['initialTopLeft'] = TOP_LEFT_CORNER_COORDS;
        selectionTool['initialBottomRight'] = {
            x: drawingServiceSpyObj.canvas.width + EXCESS_PIXELS,
            y: drawingServiceSpyObj.canvas.height + EXCESS_PIXELS,
        };

        selectionTool['adjustToDrawingBounds']();

        expect(selectionTool['initialTopLeft']).toEqual(TOP_LEFT_CORNER_COORDS);
        expect(selectionTool['initialBottomRight']).toEqual({ x: drawingServiceSpyObj.canvas.width, y: drawingServiceSpyObj.canvas.height });
    });

    it('#adjustToDrawingBounds should adjust the initial coords so that they dont go outside the canvas, under zero', () => {
        const EXCESS_PIXELS = 5;

        selectionTool['initialTopLeft'] = BOTTOM_RIGHT_CORNER_COORDS;
        selectionTool['initialBottomRight'] = {
            x: -EXCESS_PIXELS,
            y: -EXCESS_PIXELS,
        };

        selectionTool['adjustToDrawingBounds']();

        expect(selectionTool['initialTopLeft']).toEqual(BOTTOM_RIGHT_CORNER_COORDS);
        expect(selectionTool['initialBottomRight']).toEqual(TOP_LEFT_CORNER_COORDS);
    });

    it('#cancelSelection should clear the canvas', () => {
        selectionTool.cancelSelection();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
    });

    it('#cancelSelection should set the initialTopLeft coords to the initialBottomRight, if there isnt a selection yet (escape key case)', () => {
        selectionTool['initialTopLeft'] = TOP_LEFT_CORNER_COORDS;
        selectionTool['initialBottomRight'] = BOTTOM_RIGHT_CORNER_COORDS;
        selectionTool.selectionExists = false;

        selectionTool.cancelSelection();

        expect(selectionTool['initialTopLeft']).toEqual(BOTTOM_RIGHT_CORNER_COORDS);
    });

    it('#cancelSelection should draw the selection on the base context, reset values and enable undo-redo if selection exists', () => {
        selectionTool['initialTopLeft'] = TOP_LEFT_CORNER_COORDS;
        selectionTool['initialBottomRight'] = BOTTOM_RIGHT_CORNER_COORDS;

        selectionTool.selectionExists = true;
        const drawSpy = spyOn<any>(selectionTool, 'draw');
        const clearIntervalSpy = spyOn<any>(window, 'clearInterval');

        selectionTool.cancelSelection();

        expect(selectionTool['initialTopLeft']).toEqual(TOP_LEFT_CORNER_COORDS);
        expect(selectionTool['initialBottomRight']).toEqual(TOP_LEFT_CORNER_COORDS);
        expect(drawSpy).toHaveBeenCalledWith(drawingServiceSpyObj.baseCtx);
        expect(selectionTool.selectionExists).toBeFalse();
        expect(selectionTool['movingWithMouse']).toBeFalse();
        expect(selectionTool['movingWithArrows']).toBeFalse();
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
        const drawBoxSpy = spyOn<any>(selectionTool, 'drawBox');

        selectionTool['drawAll'](drawingServiceSpyObj.previewCtx);

        expect(drawSpy).toHaveBeenCalled();
        expect(drawPerimeterSpy).toHaveBeenCalled();
        expect(drawBoxSpy).toHaveBeenCalled();
    });

    it('#draw should make a new selection command using #loadUpProperties as parameter', () => {
        const loadUpPropertiesSpy = spyOn<any>(selectionTool, 'loadUpProperties');
        selectionTool['draw'](drawingServiceSpyObj.previewCtx);
        expect(loadUpPropertiesSpy).toHaveBeenCalled();
    });

    it('#draw should add a command to the undo-redo list if the initial coords are different to the final coords, and ctx is baseCtx', () => {
        selectionTool['initialTopLeft'] = TOP_LEFT_CORNER_COORDS;
        selectionTool['initialBottomRight'] = BOTTOM_RIGHT_CORNER_COORDS;
        selectionTool['finalTopLeft'] = { x: TOP_LEFT_CORNER_COORDS.x + MOUSE_POSITION.x, y: TOP_LEFT_CORNER_COORDS.y + MOUSE_POSITION.y };
        selectionTool['finalBottomRight'] = {
            x: BOTTOM_RIGHT_CORNER_COORDS.x + MOUSE_POSITION.x,
            y: BOTTOM_RIGHT_CORNER_COORDS.y + MOUSE_POSITION.y,
        };
        selectionTool['draw'](drawingServiceSpyObj.baseCtx);
        expect(undoRedoSpyObj.addCommand).toHaveBeenCalled();
    });

    it('#draw should not add a command to the undo-redo list if the initial coords the same as the final coords', () => {
        selectionTool['initialTopLeft'] = TOP_LEFT_CORNER_COORDS;
        selectionTool['initialBottomRight'] = BOTTOM_RIGHT_CORNER_COORDS;
        selectionTool['finalTopLeft'] = TOP_LEFT_CORNER_COORDS;
        selectionTool['finalBottomRight'] = BOTTOM_RIGHT_CORNER_COORDS;

        selectionTool['draw'](drawingServiceSpyObj.baseCtx);
        expect(undoRedoSpyObj.addCommand).not.toHaveBeenCalled();
    });

    it('#drawBox should draw a blue hollow rectangle and draw the controlPoints', () => {
        const drawControlPointsSpy = spyOn<any>(selectionTool, 'drawControlPoints');

        selectionTool['drawBox'](drawingServiceSpyObj.previewCtx, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);

        const borderPoint: Vec2 = { x: 0, y: 0 };
        const borderPoint2: Vec2 = { x: 20, y: 20 };
        const centerPoint: Vec2 = { x: 10, y: 10 };

        const imageDataBorder: ImageData = previewCtxStub.getImageData(borderPoint.x, borderPoint.y, 1, 1);
        expect(imageDataBorder.data[2]).toEqual(RGB_MAX);
        const imageDataBorder2: ImageData = previewCtxStub.getImageData(borderPoint2.x, borderPoint2.y, 1, 1);
        expect(imageDataBorder2.data[2]).toEqual(RGB_MAX);
        const imageDataCenter: ImageData = previewCtxStub.getImageData(centerPoint.x, centerPoint.y, 1, 1);
        expect(imageDataCenter.data).toEqual(Uint8ClampedArray.of(0, 0, 0, 0));
        expect(drawControlPointsSpy).toHaveBeenCalled();
    });

    it('#drawControlPoints should get all the control points data and draw a rectangle for each one', () => {
        const NUMBER_OF_CONTROL_POINTS = 3;
        const getControlPointsCoordsSpy = spyOn<any>(selectionTool, 'getControlPointsCoords').and.returnValue([{} as Vec2, {} as Vec2, {} as Vec2]);
        const rectSpy = spyOn(drawingServiceSpyObj.previewCtx, 'rect');

        selectionTool['drawControlPoints'](drawingServiceSpyObj.previewCtx, TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);

        expect(getControlPointsCoordsSpy).toHaveBeenCalledWith(TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS);
        expect(rectSpy).toHaveBeenCalledTimes(NUMBER_OF_CONTROL_POINTS);
    });

    it('#selectAll should execute a mouseDown followed by a mouseUp to simulate the user selecting the whole canvas', () => {
        const onMouseDownSpy = spyOn(selectionTool, 'onMouseDown');
        const onMouseUpSpy = spyOn(selectionTool, 'onMouseUp');

        selectionTool.selectAll();

        expect(onMouseDownSpy).toHaveBeenCalled();
        expect(onMouseUpSpy).toHaveBeenCalled();
    });

    it('#isInsideSelection should return true if given point is inside the selection bounds, and false otherwise', () => {
        selectionTool['finalTopLeft'] = TOP_LEFT_CORNER_COORDS;
        selectionTool['finalBottomRight'] = BOTTOM_RIGHT_CORNER_COORDS;

        expect(selectionTool['isInsideSelection']({ x: 5, y: 5 })).toBeTrue();
        expect(selectionTool['isInsideSelection']({ x: 30, y: 10 })).toBeTrue();
        expect(selectionTool['isInsideSelection']({ x: 45, y: 10 })).toBeFalse();
        expect(selectionTool['isInsideSelection']({ x: 20, y: 25 })).toBeFalse();
        expect(selectionTool['isInsideSelection']({ x: 50, y: 50 })).toBeFalse();
    });

    it('#setOffset should set the mouseMoveOffset to the difference between the given position and the top left corner', () => {
        selectionTool['finalTopLeft'] = BOTTOM_RIGHT_CORNER_COORDS;

        selectionTool['setOffSet']({ x: BOTTOM_RIGHT_CORNER_COORDS.x + MOUSE_OFFSET, y: BOTTOM_RIGHT_CORNER_COORDS.y + MOUSE_OFFSET });

        expect(selectionTool['mouseMoveOffset']).toEqual({ x: MOUSE_OFFSET, y: MOUSE_OFFSET });
    });

    it('#getControlPointsCoords should return an array of 8 coords representing the control points positions', () => {
        const NO_OF_EXPECTED_POINTS = 8;
        expect(selectionTool['getControlPointsCoords'](TOP_LEFT_CORNER_COORDS, BOTTOM_RIGHT_CORNER_COORDS).length).toEqual(NO_OF_EXPECTED_POINTS);
    });

    it('#loadUpProperties should create a SelectionProperties object with the right properties', () => {
        const TEST_DATA = drawingServiceSpyObj.previewCtx.getImageData(
            TOP_LEFT_CORNER_COORDS.x,
            TOP_LEFT_CORNER_COORDS.y,
            BOTTOM_RIGHT_CORNER_COORDS.x,
            BOTTOM_RIGHT_CORNER_COORDS.y,
        );
        selectionTool['data'] = TEST_DATA;
        selectionTool['initialTopLeft'] = TOP_LEFT_CORNER_COORDS;
        selectionTool['initialBottomRight'] = BOTTOM_RIGHT_CORNER_COORDS;
        selectionTool['finalTopLeft'] = TOP_LEFT_CORNER_COORDS;
        selectionTool['finalBottomRight'] = BOTTOM_RIGHT_CORNER_COORDS;

        const selectionProperties = selectionTool['loadUpProperties'](drawingServiceSpyObj.previewCtx);

        expect(selectionProperties.selectionCtx).toEqual(drawingServiceSpyObj.previewCtx);
        expect(selectionProperties.imageData).toEqual(TEST_DATA);
        expect(selectionProperties.topLeft).toEqual(TOP_LEFT_CORNER_COORDS);
        expect(selectionProperties.bottomRight).toEqual(BOTTOM_RIGHT_CORNER_COORDS);
        expect(selectionProperties.finalTopLeft).toEqual(TOP_LEFT_CORNER_COORDS);
        expect(selectionProperties.finalBottomRight).toEqual(BOTTOM_RIGHT_CORNER_COORDS);
    });
    // tslint:disable-next-line: max-file-line-count
});
