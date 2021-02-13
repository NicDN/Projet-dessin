// tslint:disable: no-any
// tslint:disable: no-string-literal

import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MouseButton } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { LineService } from './line.service';

describe('LineService', () => {
    let service: LineService;
    let keyboardEvent: KeyboardEvent;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;

    let updatePreviewSpy: jasmine.Spy<any>;
    let calculateAngleSpy: jasmine.Spy<any>;

    const DEFAULT_MOUSE_POSITION = { x: 45, y: 55 };
    const EXPECTED_NUMBER_OF_CALLS = 4;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LineService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        updatePreviewSpy = spyOn<any>(service, 'updatePreview').and.stub();
        calculateAngleSpy = spyOn<any>(service, 'calculateAngle').and.stub();

        service.mousePosition = DEFAULT_MOUSE_POSITION;
        service.pathData = [
            { x: 10, y: 10 },
            { x: 10, y: 15 },
            { x: 15, y: 10 },
            { x: 5, y: 5 },
        ];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onMouseDown should set mouseDown at true when Left button of the mouse is pressed', () => {
        const EXPECTED_MOUSE_DOWN = true;

        mouseEvent = { button: MouseButton.Left } as MouseEvent;

        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(EXPECTED_MOUSE_DOWN);
    });

    it('onMouseDown should set mouseDown at flase when not Left is pressed on the mouse', () => {
        const EXPECTED_MOUSE_DOWN = false;

        mouseEvent = { button: MouseButton.Right } as MouseEvent;

        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(EXPECTED_MOUSE_DOWN);
    });

    it("onMouseUp shouldn't modify the line without a release of the left mouse button", () => {
        service.mouseDown = true;
        mouseEvent = { button: MouseButton.Right } as MouseEvent;
        spyOn(service, 'addPoint');
        spyOn(service, 'finishLine');

        service.onMouseUp(mouseEvent);
        expect(service.addPoint).not.toHaveBeenCalled();
        expect(service.finishLine).not.toHaveBeenCalled();
    });

    it("onMouseUp shouldn't modify the line without a press of the left mouse button", () => {
        service.mouseDown = false;
        mouseEvent = { button: MouseButton.Left } as MouseEvent;
        spyOn(service, 'addPoint');
        spyOn(service, 'finishLine');

        service.onMouseUp(mouseEvent);
        expect(service.addPoint).not.toHaveBeenCalled();
        expect(service.finishLine).not.toHaveBeenCalled();
    });

    it('onMouseUp should call addPoint with a simple left click', () => {
        mouseEvent = { button: MouseButton.Left } as MouseEvent;
        service.mouseDown = true;
        service.canDoubleClick = false;
        spyOn(service, 'addPoint');

        service.onMouseUp(mouseEvent);
        expect(service.addPoint).toHaveBeenCalled();
    });

    it('onMouseUp should call finishLine with a double left click if theres a line', () => {
        mouseEvent = { button: MouseButton.Left } as MouseEvent;
        service.pathData = [
            { x: 5, y: 5 },
            { x: 7, y: 7 },
        ];
        service.mouseDown = true;
        service.canDoubleClick = true;
        spyOn(service, 'finishLine');

        service.onMouseUp(mouseEvent);
        expect(service.finishLine).toHaveBeenCalled();
    });

    it('onMouseUp should call nothing with a double left click if theres no line', () => {
        mouseEvent = { button: MouseButton.Left } as MouseEvent;
        service.pathData = [];
        service.mouseDown = true;
        service.canDoubleClick = true;
        spyOn(service, 'finishLine');
        spyOn(service, 'addPoint');

        service.onMouseUp(mouseEvent);
        expect(service.finishLine).not.toHaveBeenCalled();
        expect(service.addPoint).not.toHaveBeenCalled();
    });

    it("onMouseMove shouldn't call lockLine when shift isn't pressed", () => {
        service.isShiftDown = false;
        mouseEvent = {} as MouseEvent;
        spyOn(service, 'lockLine');

        service.onMouseMove(mouseEvent);
        expect(service.lockLine).not.toHaveBeenCalled();
        expect(updatePreviewSpy).toHaveBeenCalled();
    });

    it('onMouseMove should call lockLine when shift is pressed', () => {
        service.isShiftDown = true;
        mouseEvent = {} as MouseEvent;
        spyOn(service, 'lockLine');

        service.onMouseMove(mouseEvent);
        expect(service.lockLine).toHaveBeenCalled();
        expect(updatePreviewSpy).not.toHaveBeenCalled();
    });

    it('onKeyDown should call clearPath when Escape is pressed', () => {
        keyboardEvent = { code: 'Escape' } as KeyboardEvent;
        spyOn(service, 'clearPath');

        service.onKeyDown(keyboardEvent);
        expect(service.clearPath).toHaveBeenCalled();
    });

    it('onKeyDown should call removePoint when Backspace is pressed', () => {
        keyboardEvent = { code: 'Backspace' } as KeyboardEvent;
        spyOn(service, 'removePoint');

        service.onKeyDown(keyboardEvent);
        expect(service.removePoint).toHaveBeenCalled();
    });

    it('onKeyDown should call lockLine when ShiftLeft is pressed', () => {
        keyboardEvent = { code: 'ShiftLeft' } as KeyboardEvent;
        spyOn(service, 'lockLine');

        service.onKeyDown(keyboardEvent);
        expect(service.lockLine).toHaveBeenCalled();
    });

    it('onKeyDown should call lockLine when ShiftRight is pressed', () => {
        keyboardEvent = { code: 'ShiftRight' } as KeyboardEvent;
        spyOn(service, 'lockLine');

        service.onKeyDown(keyboardEvent);
        expect(service.lockLine).toHaveBeenCalled();
    });

    it('onKeyDown shouldnt call anything if no key is pressed', () => {
        keyboardEvent = {} as KeyboardEvent;
        spyOn(service, 'lockLine');
        spyOn(service, 'removePoint');
        spyOn(service, 'clearPath');

        service.onKeyDown(keyboardEvent);
        expect(service.lockLine).not.toHaveBeenCalled();
        expect(service.removePoint).not.toHaveBeenCalled();
        expect(service.clearPath).not.toHaveBeenCalled();
    });

    it('onKeyUp should update isShiftDown when ShiftLeft is pressed', () => {
        const EXPECT_IS_SHIFT_DOWN = false;
        service.isShiftDown = true;
        keyboardEvent = { code: 'ShiftLeft' } as KeyboardEvent;

        service.onKeyUp(keyboardEvent);
        expect(service.isShiftDown).toEqual(EXPECT_IS_SHIFT_DOWN);
    });

    it('onKeyUp should update isShiftDown when ShiftRight is pressed', () => {
        const EXPECT_IS_SHIFT_DOWN = false;
        service.isShiftDown = true;
        keyboardEvent = { code: 'ShiftRight' } as KeyboardEvent;

        service.onKeyUp(keyboardEvent);
        expect(service.isShiftDown).toEqual(EXPECT_IS_SHIFT_DOWN);
    });

    it("onKeyUp shouldn't call updatePreview when no shift are pressed", () => {
        keyboardEvent = { code: 'KeyL' } as KeyboardEvent;

        service.onKeyUp(keyboardEvent);
        expect(updatePreviewSpy).not.toHaveBeenCalled();
    });

    it('addPoint should add a point in pathData', () => {
        service.addPoint();
        expect(service.pathData[service.pathData.length - 1]).toEqual(DEFAULT_MOUSE_POSITION);
    });

    it('removePoint shouldnt remove a point if theres not enough', () => {
        service.pathData = [];

        service.removePoint();
        expect(service.pathData.length).toEqual(0);
    });

    it('removePoint should remove a point', () => {
        const EXPECTED_LENGTH = 3;
        service.removePoint();
        expect(service.pathData.length).toEqual(EXPECTED_LENGTH);
    });

    it('finishLine shouldnt change the last point if it isnt near the first', () => {
        const EXPECTED_LAST_POINT: Vec2 = { x: 5, y: 5 };

        spyOn(service, 'drawLine');
        spyOn(service, 'clearPath');

        service.finishLine();
        expect(service.pathData[service.pathData.length - 1]).toEqual(EXPECTED_LAST_POINT);
        expect(service.drawLine).toHaveBeenCalled();
        expect(service.clearPath).toHaveBeenCalled();
    });

    it('finishLine should change the last point if it is near the first', () => {
        const EXPECTED_LAST_POINT: Vec2 = { x: 10, y: 10 };
        service.mousePosition = { x: 20, y: 20 };

        spyOn(service, 'drawLine');
        spyOn(service, 'clearPath');

        service.finishLine();
        expect(service.pathData[service.pathData.length - 1]).toEqual(EXPECTED_LAST_POINT);
        expect(service.drawLine).toHaveBeenCalled();
        expect(service.clearPath).toHaveBeenCalled();
    });

    it('updatePreview should call drwaingService.clearCanvas and drawLine', () => {
        spyOn(service['drawingService'], 'clearCanvas');
        spyOn(service, 'drawLine');
        updatePreviewSpy.and.callThrough();

        service.updatePreview();
        expect(service['drawingService'].clearCanvas).toHaveBeenCalled();
        expect(service.drawLine).toHaveBeenCalled();
    });

    it('calculateAngle should set shiftAngle correctly', () => {
        const EXPECTED_ANGLE = 225;
        const lastSelectedPoint = { x: 55, y: 65 };
        calculateAngleSpy.and.callThrough();

        expect(service.calculateAngle(lastSelectedPoint)).toEqual(EXPECTED_ANGLE);
    });

    it('calculateAngle should keep the angle in degrees above 0', () => {
        const lastSelectedPoint = { x: 55, y: 10 };
        calculateAngleSpy.and.callThrough();

        expect(service.calculateAngle(lastSelectedPoint) > 0).toEqual(true);
    });

    it('drawLine should not draw anything if theres no point in the path', () => {
        service.pathData = [];
        spyOn(baseCtxStub, 'lineTo');

        service.drawLine(baseCtxStub, service.pathData);
        expect(baseCtxStub.lineTo).not.toHaveBeenCalled();
    });

    it('drawLine should not draw junctions if drawWithJunction isnt set', () => {
        spyOn(baseCtxStub, 'lineTo');
        spyOn(baseCtxStub, 'fill');

        service.drawLine(baseCtxStub, service.pathData);
        expect(baseCtxStub.lineTo).toHaveBeenCalledTimes(EXPECTED_NUMBER_OF_CALLS);
        expect(baseCtxStub.fill).not.toHaveBeenCalled();
    });

    it('drawLine should draw junctions if drawWithJunction is set', () => {
        service.drawWithJunction = true;
        spyOn(baseCtxStub, 'lineTo');
        spyOn(baseCtxStub, 'fill');

        service.drawLine(baseCtxStub, service.pathData);
        expect(baseCtxStub.lineTo).toHaveBeenCalledTimes(EXPECTED_NUMBER_OF_CALLS);
        expect(baseCtxStub.fill).toHaveBeenCalledTimes(EXPECTED_NUMBER_OF_CALLS);
    });

    it('lockLine should lock the line near the x axis', () => {
        const EXPECTED_Y_POSITION = 55;
        const DEFAULT_ANGLE = 3;
        calculateAngleSpy.and.returnValue(DEFAULT_ANGLE);

        service.lockLine();
        expect(service.pathData[service.pathData.length - 1].y).toEqual(EXPECTED_Y_POSITION);
    });

    it('lockLine should lock the line near the y axis', () => {
        const EXPECTED_X_POSITION = 45;
        const DEFAULT_ANGLE = 87;
        calculateAngleSpy.and.returnValue(DEFAULT_ANGLE);

        service.lockLine();
        expect(service.pathData[service.pathData.length - 1].x).toEqual(EXPECTED_X_POSITION);
    });

    it('lockLine should lock the line near the first diagonal', () => {
        const EXPECTED_Y_POSITION = 40;
        const DEFAULT_ANGLE = 47;
        calculateAngleSpy.and.returnValue(DEFAULT_ANGLE);

        service.lockLine();
        expect(service.pathData[service.pathData.length - 1].y).toEqual(EXPECTED_Y_POSITION);
    });

    it('lockLine should lock the line near the second diagonal', () => {
        const EXPECTED_Y_POSITION = -20;
        const DEFAULT_ANGLE = 133;
        calculateAngleSpy.and.returnValue(DEFAULT_ANGLE);

        service.lockLine();
        expect(service.pathData[service.pathData.length - 1].y).toEqual(EXPECTED_Y_POSITION);
    });

    it('clearPath should clear pathData', () => {
        service.clearPath();
        expect(service.pathData).toEqual([]);
    });
});
