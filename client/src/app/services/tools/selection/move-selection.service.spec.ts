import { TestBed } from '@angular/core/testing';
import { BoxSize } from '@app/classes/box-size';
import { SelectionCoords } from '@app/classes/selection-tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { of } from 'rxjs';
import { MoveSelectionService, SelectedPoint } from './move-selection.service';

// tslint:disable: no-any
// tslint:disable: no-string-literal
// tslint:disable: max-file-line-count
describe('MoveSelectionService', () => {
    let service: MoveSelectionService;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let gridServiceSpyObj: jasmine.SpyObj<GridService>;

    let selectionCoordsStub: SelectionCoords;
    let selectionWidth: number;
    let selectionHeight: number;

    const MOUSE_POSITION: Vec2 = { x: 25, y: 25 };
    const MOUSE_OFFSET = 5;
    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 40 };
    const boxSizeStub: BoxSize = { widthBox: 100, heightBox: 100 };
    const SQUARE_SIZE = 40;

    let deltaX = 60;
    let deltaY = 60;
    let mouseOffsetTopToMagnetize = { x: MOUSE_OFFSET, y: MOUSE_OFFSET };
    let mouseOffsetBottomToMagnetize = MOUSE_POSITION;
    let positionToMagnetize = { x: 60, y: 40 };

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'newIncomingResizeSignals', 'newGridSignals']);
        gridServiceSpyObj = jasmine.createSpyObj('GridService', ['']);
        // tslint:disable-next-line: prefer-const
        let emptyMessage: any;
        drawingServiceSpyObj.newGridSignals.and.returnValue(of(emptyMessage));
        drawingServiceSpyObj.newIncomingResizeSignals.and.returnValue(of(boxSizeStub));
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpyObj }],
        });

        selectionCoordsStub = {
            initialTopLeft: TOP_LEFT_CORNER_COORDS,
            initialBottomRight: BOTTOM_RIGHT_CORNER_COORDS,
            finalTopLeft: TOP_LEFT_CORNER_COORDS,
            finalBottomRight: BOTTOM_RIGHT_CORNER_COORDS,
        };

        selectionWidth = BOTTOM_RIGHT_CORNER_COORDS.x - TOP_LEFT_CORNER_COORDS.x;
        selectionHeight = BOTTOM_RIGHT_CORNER_COORDS.y - TOP_LEFT_CORNER_COORDS.y;

        gridServiceSpyObj.squareSize = SQUARE_SIZE;
        service = TestBed.inject(MoveSelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#calculateDelta should calculate by how much the selection should move based on every arrow key condition', () => {
        service.keyDownIsPressed = true;
        service.keyLeftIsPressed = true;

        const calculatedDelta = service.calculateDelta();

        expect(calculatedDelta).toEqual({ x: -service.arrowMoveDelta, y: service.arrowMoveDelta });
    });

    it('#calculateDelta should calculate by how much the selection should move based on every arrow key condition', () => {
        service.keyUpIsPressed = true;
        service.keyRightIsPressed = true;

        const calculatedDelta = service.calculateDelta();

        expect(calculatedDelta).toEqual({ x: service.arrowMoveDelta, y: -service.arrowMoveDelta });
    });

    it('#calculateDelta should return 0,0 if everykey is pressed', () => {
        service.keyDownIsPressed = true;
        service.keyLeftIsPressed = true;
        service.keyRightIsPressed = true;
        service.keyUpIsPressed = true;

        const calculatedDelta = service.calculateDelta();

        expect(calculatedDelta).toEqual({ x: 0, y: 0 });
    });

    it('#checkIfAnyArrowIsPressed should return true if any of the arrow press booleans are true', () => {
        service.keyUpIsPressed = true;
        const anyArrowPressed = service.checkIfAnyArrowIsPressed();
        expect(anyArrowPressed).toBeTrue();
    });

    it('#checkIfAnyArrowIsPressed should return true if any of the arrow press booleans are true', () => {
        service.keyDownIsPressed = true;
        const anyArrowPressed = service.checkIfAnyArrowIsPressed();
        expect(anyArrowPressed).toBeTrue();
    });

    it('#checkIfAnyArrowIsPressed should return true if any of the arrow press booleans are true', () => {
        service.keyLeftIsPressed = true;
        const anyArrowPressed = service.checkIfAnyArrowIsPressed();
        expect(anyArrowPressed).toBeTrue();
    });

    it('#checkIfAnyArrowIsPressed should return true if any of the arrow press booleans are true', () => {
        service.keyRightIsPressed = true;
        const anyArrowPressed = service.checkIfAnyArrowIsPressed();
        expect(anyArrowPressed).toBeTrue();
    });

    it('#updateArrowKeysPressed should change the arrow press boolean related to the KeyboardEvent to true, and not affect the others, when applicable', () => {
        service.keyDownIsPressed = false;
        service.keyUpIsPressed = true;
        service.keyLeftIsPressed = false;
        service.keyRightIsPressed = true;
        const arrowEvent = { code: 'ArrowLeft' } as KeyboardEvent;

        service.updateArrowKeysPressed(arrowEvent, true);

        expect(service.keyDownIsPressed).toBeFalse();
        expect(service.keyUpIsPressed).toBeTrue();
        expect(service.keyLeftIsPressed).toBeTrue();
        expect(service.keyRightIsPressed).toBeTrue();
    });

    it('#updateArrowKeysPressed should change every arrowPress boolean to the given parameter if all keys are pressed in sucession', () => {
        service.keyDownIsPressed = false;
        service.keyUpIsPressed = false;
        service.keyLeftIsPressed = false;
        service.keyRightIsPressed = false;

        service.updateArrowKeysPressed({ code: 'ArrowLeft' } as KeyboardEvent, true);
        service.updateArrowKeysPressed({ code: 'ArrowUp' } as KeyboardEvent, true);
        service.updateArrowKeysPressed({ code: 'ArrowDown' } as KeyboardEvent, true);
        service.updateArrowKeysPressed({ code: 'ArrowRight' } as KeyboardEvent, true);

        expect(service.keyDownIsPressed).toBeTrue();
        expect(service.keyUpIsPressed).toBeTrue();
        expect(service.keyLeftIsPressed).toBeTrue();
        expect(service.keyRightIsPressed).toBeTrue();
    });

    it('#updateArrowKeysPressed should change the arrow press boolean related to the KeyboardEvent to false, and not affect the others, when applicable', () => {
        service.keyDownIsPressed = false;
        service.keyUpIsPressed = true;
        service.keyLeftIsPressed = false;
        service.keyRightIsPressed = true;
        const arrowEvent = { code: 'ArrowUp' } as KeyboardEvent;

        service.updateArrowKeysPressed(arrowEvent, false);

        expect(service.keyDownIsPressed).toBeFalse();
        expect(service.keyUpIsPressed).toBeFalse();
        expect(service.keyLeftIsPressed).toBeFalse();
        expect(service.keyRightIsPressed).toBeTrue();
    });

    it('#moveSelectionWithArrows should move the selection coordinates by the given delta and redraw selection at the new position', () => {
        service.isUsingMagnet = false;
        selectionCoordsStub.finalTopLeft = { x: TOP_LEFT_CORNER_COORDS.x, y: TOP_LEFT_CORNER_COORDS.y };
        selectionCoordsStub.finalBottomRight = { x: BOTTOM_RIGHT_CORNER_COORDS.x, y: BOTTOM_RIGHT_CORNER_COORDS.y };

        service.moveSelectionWithArrows(
            drawingServiceSpyObj.previewCtx,
            {
                x: service.arrowMoveDelta,
                y: service.arrowMoveDelta,
            },
            selectionCoordsStub,
        );
        expect(selectionCoordsStub.finalTopLeft).toEqual({
            x: TOP_LEFT_CORNER_COORDS.x + service.arrowMoveDelta,
            y: TOP_LEFT_CORNER_COORDS.y + service.arrowMoveDelta,
        });
        expect(selectionCoordsStub.finalBottomRight).toEqual({
            x: BOTTOM_RIGHT_CORNER_COORDS.x + service.arrowMoveDelta,
            y: BOTTOM_RIGHT_CORNER_COORDS.y + service.arrowMoveDelta,
        });
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
    });

    it('#moveSelectionWithArrows should call alignToProperMagnetArrowPosition if usingMagnet is true', () => {
        service.isUsingMagnet = true;
        selectionCoordsStub.finalBottomRight = BOTTOM_RIGHT_CORNER_COORDS;
        selectionCoordsStub.finalTopLeft = TOP_LEFT_CORNER_COORDS;

        const alignToProperMagnetArrowPositionSpy = spyOn<any>(service, 'alignToProperMagnetArrowPosition');
        service.moveSelectionWithArrows(drawingServiceSpyObj.previewCtx, MOUSE_POSITION, selectionCoordsStub);
        expect(alignToProperMagnetArrowPositionSpy).toHaveBeenCalled();
    });

    it('#moveSelectionWithMouse should move the selection coordinates to the given position minus the mouseOffset, and redraw the selection', () => {
        service.isUsingMagnet = false;
        selectionCoordsStub.initialTopLeft = TOP_LEFT_CORNER_COORDS;
        selectionCoordsStub.initialBottomRight = BOTTOM_RIGHT_CORNER_COORDS;
        selectionCoordsStub.finalTopLeft = TOP_LEFT_CORNER_COORDS;
        selectionCoordsStub.finalBottomRight = BOTTOM_RIGHT_CORNER_COORDS;
        service.mouseMoveOffset = { x: MOUSE_OFFSET, y: MOUSE_OFFSET };

        service.moveSelectionWithMouse(drawingServiceSpyObj.previewCtx, MOUSE_POSITION, selectionCoordsStub);
        expect(selectionCoordsStub.finalTopLeft).toEqual({
            x: MOUSE_POSITION.x - MOUSE_OFFSET,
            y: MOUSE_POSITION.y - MOUSE_OFFSET,
        });
        expect(selectionCoordsStub.finalBottomRight).toEqual({
            x: MOUSE_POSITION.x - MOUSE_OFFSET + selectionWidth,
            y: MOUSE_POSITION.y - MOUSE_OFFSET + selectionHeight,
        });
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
    });

    it('#alignToProperMagnetArrowPosition should keep values of  deltaX and deltaY if they are negative  ', () => {
        const negativeDelta = -20;
        deltaX = negativeDelta;
        deltaY = negativeDelta;
        service['alignToProperMagnetArrowPosition'](selectionCoordsStub, deltaX, deltaY, selectionWidth, selectionHeight);
        expect(deltaX).toEqual(negativeDelta);
        expect(deltaY).toEqual(negativeDelta);
    });

    it('#alignToProperMagnetArrowPosition should keep the values of deltaX and deltaY if they equal 0  ', () => {
        deltaX = 0;
        deltaY = 0;
        service['alignToProperMagnetArrowPosition'](selectionCoordsStub, deltaX, deltaY, selectionWidth, selectionHeight);
        expect(deltaX).toEqual(0);
        expect(deltaY).toEqual(0);
    });

    it('#alignToProperMagnetArrowPosition should align the selection to the TOP_LEFT position when using arrows', () => {
        service.pointToMagnetize = SelectedPoint.TOP_LEFT;
        service['alignToProperMagnetArrowPosition'](selectionCoordsStub, deltaX, deltaY, selectionWidth, selectionHeight);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#alignToProperMagnetArrowPosition should align the selection to the TOP_MIDDLE position when using arrows', () => {
        service.pointToMagnetize = SelectedPoint.TOP_MIDDLE;
        service['alignToProperMagnetArrowPosition'](selectionCoordsStub, deltaX, deltaY, selectionWidth, selectionHeight);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#alignToProperMagnetArrowPosition should align the selection to the TOP_RIGHT position when using arrows', () => {
        service.pointToMagnetize = SelectedPoint.TOP_RIGHT;
        service['alignToProperMagnetArrowPosition'](selectionCoordsStub, deltaX, deltaY, selectionWidth, selectionHeight);
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(selectionCoordsStub.finalBottomRight.x - selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#alignToProperMagnetArrowPosition should align the selection to the MIDDLE_LEFT position when using arrows', () => {
        service.pointToMagnetize = SelectedPoint.MIDDLE_LEFT;
        service['alignToProperMagnetArrowPosition'](selectionCoordsStub, deltaX, deltaY, selectionWidth, selectionHeight);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#alignToProperMagnetArrowPosition should align the selection to the CENTER position when using arrows', () => {
        service.pointToMagnetize = SelectedPoint.CENTER;
        service['alignToProperMagnetArrowPosition'](selectionCoordsStub, deltaX, deltaY, selectionWidth, selectionHeight);
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(selectionCoordsStub.finalBottomRight.x - selectionWidth);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(selectionCoordsStub.finalBottomRight.y - selectionHeight);
    });

    it('#alignToProperMagnetArrowPosition should align the selection to the MIDDLE_RIGHT position when using arrows', () => {
        service.pointToMagnetize = SelectedPoint.MIDDLE_RIGHT;
        service['alignToProperMagnetArrowPosition'](selectionCoordsStub, deltaX, deltaY, selectionWidth, selectionHeight);
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(selectionCoordsStub.finalBottomRight.x - selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#alignToProperMagnetArrowPosition should align the selection to the BOTTOM_LEFT position when using arrows', () => {
        service.pointToMagnetize = SelectedPoint.BOTTOM_LEFT;
        service['alignToProperMagnetArrowPosition'](selectionCoordsStub, deltaX, deltaY, selectionWidth, selectionHeight);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(selectionCoordsStub.finalBottomRight.y - selectionHeight);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
    });

    it('#alignToProperMagnetArrowPosition should align the selection to the BOTTOM_MIDDLE position when using arrows', () => {
        service.pointToMagnetize = SelectedPoint.BOTTOM_MIDDLE;
        service['alignToProperMagnetArrowPosition'](selectionCoordsStub, deltaX, deltaY, selectionWidth, selectionHeight);
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(selectionCoordsStub.finalBottomRight.x - selectionWidth);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(selectionCoordsStub.finalBottomRight.y - selectionHeight);
    });

    it('#alignToProperMagnetArrowPosition should align the selection to the BOTTOM_RIGHT position when using arrows', () => {
        service.pointToMagnetize = SelectedPoint.BOTTOM_RIGHT;
        service['alignToProperMagnetArrowPosition'](selectionCoordsStub, deltaX, deltaY, selectionWidth, selectionHeight);
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(selectionCoordsStub.finalBottomRight.x - selectionWidth);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(selectionCoordsStub.finalBottomRight.y - selectionHeight);
    });

    it('#alignToProperMagnetMousePosition should align the selection to the TOP_LEFT position', () => {
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        service.pointToMagnetize = SelectedPoint.TOP_LEFT;
        service['alignToProperMagnetMousePosition'](positionToMagnetize, selectionCoordsStub, selectionWidth, selectionHeight);

        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#alignToProperMagnetMousePosition should align the selection to the TOP_MIDDLE position', () => {
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        service.pointToMagnetize = SelectedPoint.TOP_MIDDLE;
        service['alignToProperMagnetMousePosition'](
            { x: positionToMagnetize.x - selectionWidth / 2, y: positionToMagnetize.y },
            selectionCoordsStub,
            selectionWidth,
            selectionHeight,
        );

        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x - selectionWidth / 2);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#alignToProperMagnetMousePosition should align the selection to the TOP_RIGHT position', () => {
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        mouseOffsetBottomToMagnetize = service['getMagnetizedOffsetPosition']();
        service.pointToMagnetize = SelectedPoint.TOP_RIGHT;
        service['alignToProperMagnetMousePosition'](positionToMagnetize, selectionCoordsStub, selectionWidth, selectionHeight);

        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x - selectionWidth);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(positionToMagnetize.x + mouseOffsetBottomToMagnetize.x);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#alignToProperMagnetMousePosition should align the selection to the MIDDLE_LEFT position', () => {
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        service.pointToMagnetize = SelectedPoint.MIDDLE_LEFT;
        service['alignToProperMagnetMousePosition'](
            { x: positionToMagnetize.x, y: positionToMagnetize.y - selectionHeight / 2 },
            selectionCoordsStub,
            selectionWidth,
            selectionHeight,
        );

        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y - selectionHeight / 2);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#alignToProperMagnetMousePosition should align the selection to the CENTER position', () => {
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        service.pointToMagnetize = SelectedPoint.CENTER;
        service['alignToProperMagnetMousePosition'](positionToMagnetize, selectionCoordsStub, selectionWidth, selectionHeight);

        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(selectionCoordsStub.finalTopLeft.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(selectionCoordsStub.finalTopLeft.y + selectionHeight);
    });

    it('#alignToProperMagnetMousePosition should align the selection to the MIDDLE_RIGHT position', () => {
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        service.pointToMagnetize = SelectedPoint.MIDDLE_RIGHT;
        service['alignToProperMagnetMousePosition'](
            { x: positionToMagnetize.x, y: positionToMagnetize.y - selectionHeight / 2 },
            selectionCoordsStub,
            selectionWidth,
            selectionHeight,
        );

        expect(selectionCoordsStub.finalBottomRight.x).toEqual(positionToMagnetize.x + mouseOffsetTopToMagnetize.x);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(positionToMagnetize.y - mouseOffsetTopToMagnetize.y + selectionHeight / 2);
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(selectionCoordsStub.finalBottomRight.x - selectionWidth);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(selectionCoordsStub.finalBottomRight.y - selectionHeight);
    });

    it('#alignToProperMagnetMousePosition should align the selection to the BOTTOM_LEFT position', () => {
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        mouseOffsetBottomToMagnetize = service['getMagnetizedOffsetPosition']();
        service.pointToMagnetize = SelectedPoint.BOTTOM_LEFT;
        service['alignToProperMagnetMousePosition'](positionToMagnetize, selectionCoordsStub, selectionWidth, selectionHeight);

        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y + mouseOffsetBottomToMagnetize.y - selectionHeight);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x + selectionWidth);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(positionToMagnetize.y + mouseOffsetBottomToMagnetize.y);
    });

    it('#alignToProperMagnetMousePosition should align the selection to the BOTTOM_MIDDLE position', () => {
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        mouseOffsetBottomToMagnetize = service['getMagnetizedOffsetPosition']();
        service.pointToMagnetize = SelectedPoint.BOTTOM_MIDDLE;
        service['alignToProperMagnetMousePosition'](
            { x: positionToMagnetize.x - selectionWidth / 2, y: positionToMagnetize.y },
            selectionCoordsStub,
            selectionWidth,
            selectionHeight,
        );

        expect(selectionCoordsStub.finalTopLeft.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x - selectionWidth / 2);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(positionToMagnetize.y + mouseOffsetBottomToMagnetize.y - selectionHeight);
        expect(selectionCoordsStub.finalBottomRight.x).toEqual(positionToMagnetize.x - mouseOffsetTopToMagnetize.x + selectionWidth / 2);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(positionToMagnetize.y + mouseOffsetBottomToMagnetize.y);
    });

    it('#alignToProperMagnetMousePosition should align the selection to the BOTTOM_RIGHT position', () => {
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        mouseOffsetBottomToMagnetize = service['getMagnetizedOffsetPosition']();
        service.pointToMagnetize = SelectedPoint.BOTTOM_RIGHT;
        service['alignToProperMagnetMousePosition'](positionToMagnetize, selectionCoordsStub, selectionWidth, selectionHeight);

        expect(selectionCoordsStub.finalBottomRight.x).toEqual(positionToMagnetize.x + mouseOffsetBottomToMagnetize.x);
        expect(selectionCoordsStub.finalBottomRight.y).toEqual(positionToMagnetize.y + mouseOffsetBottomToMagnetize.y);
        expect(selectionCoordsStub.finalTopLeft.x).toEqual(selectionCoordsStub.finalBottomRight.x - selectionWidth);
        expect(selectionCoordsStub.finalTopLeft.y).toEqual(selectionCoordsStub.finalBottomRight.y - selectionHeight);
    });

    it('#moveSelectionWithMouse should call alignToProperMagnetMousePosition if usingMagnet is true', () => {
        service.isUsingMagnet = true;
        const alignToProperMagnetMousePositionSpy = spyOn<any>(service, 'alignToProperMagnetMousePosition');
        service.moveSelectionWithMouse(drawingServiceSpyObj.previewCtx, MOUSE_POSITION, selectionCoordsStub);
        expect(alignToProperMagnetMousePositionSpy).toHaveBeenCalled();
    });

    it('#finalMagnetized should call magnetizeX if we need to magnetize the x coordinate', () => {
        positionToMagnetize = selectionCoordsStub.finalTopLeft;
        const magnetizeXSpy = spyOn<any>(service, 'magnetizeX');
        service['finalMagnetized'](positionToMagnetize, true, false);
        expect(magnetizeXSpy).toHaveBeenCalled();
    });

    it('#finalMagnetized should call magnetizeY if we need to magnetize the Y coordinate', () => {
        positionToMagnetize = selectionCoordsStub.finalTopLeft;
        const magnetizeYSpy = spyOn<any>(service, 'magnetizeY');
        service['finalMagnetized'](positionToMagnetize, false, true);
        expect(magnetizeYSpy).toHaveBeenCalled();
    });

    it('#finalMagnetized should call magnetizeY and magnetizeX if we need to magnetize both coordinates', () => {
        positionToMagnetize = selectionCoordsStub.finalBottomRight;
        const magnetizeXSpy = spyOn<any>(service, 'magnetizeX');
        const magnetizeYSpy = spyOn<any>(service, 'magnetizeY');
        service['finalMagnetized'](positionToMagnetize, true, true);
        expect(magnetizeXSpy).toHaveBeenCalled();
        expect(magnetizeYSpy).toHaveBeenCalled();
    });

    it('#translateCoords should translate the coordinates with the proper parameters', () => {
        let positionToTranslate = selectionCoordsStub.finalBottomRight;
        positionToTranslate = service['translateCoords'](positionToTranslate, MOUSE_OFFSET, MOUSE_OFFSET, selectionWidth, selectionHeight);
        expect(positionToTranslate.x).toEqual(selectionCoordsStub.finalBottomRight.x + MOUSE_OFFSET + selectionWidth);
        expect(positionToTranslate.y).toEqual(selectionCoordsStub.finalBottomRight.y + MOUSE_OFFSET + selectionHeight);
    });

    it('#magnetizeX should round the x coordinate of a position to the nearest grid square', () => {
        positionToMagnetize = selectionCoordsStub.finalBottomRight;
        positionToMagnetize = service['magnetizeX'](selectionCoordsStub.finalBottomRight);
        expect(positionToMagnetize.x).toEqual(Math.round(positionToMagnetize.x / gridServiceSpyObj.squareSize) * gridServiceSpyObj.squareSize);
        expect(positionToMagnetize.y).toEqual(selectionCoordsStub.finalBottomRight.y);
    });

    it('#magnetizeY should round the y coordinate of a position to the nearest grid square', () => {
        positionToMagnetize = selectionCoordsStub.finalBottomRight;
        positionToMagnetize = service['magnetizeY'](selectionCoordsStub.finalBottomRight);
        expect(positionToMagnetize.y).toEqual(Math.round(positionToMagnetize.y / gridServiceSpyObj.squareSize) * gridServiceSpyObj.squareSize);
        expect(positionToMagnetize.x).toEqual(selectionCoordsStub.finalBottomRight.x);
    });

    it('#getMagnetizedOffsetPosition should magnetize the mouse move offset position', () => {
        const EXPECTED_MAGNETIZED_MOUSE_OFFSET = 0;
        service.mouseMoveOffset = mouseOffsetTopToMagnetize;
        mouseOffsetTopToMagnetize = service['getMagnetizedOffsetPosition']();
        expect(mouseOffsetTopToMagnetize.x).toEqual(EXPECTED_MAGNETIZED_MOUSE_OFFSET);
        expect(mouseOffsetTopToMagnetize.y).toEqual(EXPECTED_MAGNETIZED_MOUSE_OFFSET);
    });
});
