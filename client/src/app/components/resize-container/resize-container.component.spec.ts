import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { BoxSize } from '@app/classes/box-size';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, HALF_RATIO, SIDE_BAR_SIZE } from '@app/components/drawing/drawing.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { of } from 'rxjs';
// import 'rxjs/add/observable/of';

import { ResizeContainerComponent, Status } from './resize-container.component';
// tslint:disable: no-any no-string-literal
describe('ResizeContainerComponent', () => {
    let component: ResizeContainerComponent;
    let fixture: ComponentFixture<ResizeContainerComponent>;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;
    const boxSizeStub: BoxSize = { widthBox: 1, heightBox: 1 };

    const OVER_MINIMUM_X_COORDINATE = 1000;
    const OVER_MINIMUM_Y_COORDINATE = 1000;
    const UNDER_MINIMUM_X_COORDINATE = 600;
    const UNDER_MINIMUM_Y_COORDINATE = 200;
    const mouseEventClick = { pageX: OVER_MINIMUM_X_COORDINATE, pageY: OVER_MINIMUM_Y_COORDINATE, button: 0 } as MouseEvent;

    beforeEach(async(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['onSizeChange', 'newIncomingResizeSignals', 'sendNotifToResize']);
        drawingServiceSpyObj.newIncomingResizeSignals.and.returnValue(of(boxSizeStub));

        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
        TestBed.configureTestingModule({
            declarations: [ResizeContainerComponent],
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: UndoRedoService, useValue: undoRedoServiceSpyObj },
                { provide: MatDialog, useValue: {} },
            ],
            imports: [RouterTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ResizeContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#onMouseDown should emit a signal to drawing one of the control points is being used', () => {
        const emitUsingButton: jasmine.Spy = spyOn(component.usingButton, 'emit');
        component.onMouseDown(mouseEventClick, Status.RESIZE_DIAGONAL);
        const arg: any = (component.usingButton.emit as any).calls.mostRecent().args[0];
        expect(arg).toBeTrue();
        expect(emitUsingButton).toHaveBeenCalled();
    });

    it('#onMouseMove should call resize when status is something else than NOT_RESIZING', () => {
        component.status = Status.RESIZE_DIAGONAL;
        const mouseEventSpy = spyOn(component, 'resize');
        component.onMouseMove(mouseEventClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventClick);
    });

    it('#onMouseMove should not call resize when status is something else than NOT_RESIZING', () => {
        component.status = Status.NOT_RESIZING;
        const mouseEventSpy = spyOn(component, 'resize');
        component.onMouseMove(mouseEventClick);
        expect(mouseEventSpy).not.toHaveBeenCalled();
        expect(mouseEventSpy).not.toHaveBeenCalledWith(mouseEventClick);
    });

    it('#onMouseUp should emit a signal to drawing component that one of the control points is no longer being used', () => {
        const emitUsingButton: jasmine.Spy = spyOn(component.usingButton, 'emit');
        component.onMouseUp(mouseEventClick);
        const arg: any = (component.usingButton.emit as any).calls.mostRecent().args[0];
        expect(arg).toBeFalse();
        expect(emitUsingButton).toHaveBeenCalled();
    });

    it('#onMouseUp should call onMouseUpContainer on mouse up ', () => {
        const calledOnMouseUpContainerFunction: jasmine.Spy = spyOn(component, 'onMouseUpContainer');
        window.dispatchEvent(new MouseEvent('mouseup'));
        expect(calledOnMouseUpContainerFunction).toHaveBeenCalled();
    });

    it('#onMouseUpContainer should put the status back to NOT_RESIZING', () => {
        component.setStatus(Status.NOT_RESIZING);
        component.onMouseUpContainer();
        expect(component.status).toEqual(Status.NOT_RESIZING);
    });

    it('#setStatus should change the status', () => {
        component.setStatus(Status.NOT_RESIZING);
        expect(component.status).toEqual(Status.NOT_RESIZING);

        component.setStatus(Status.RESIZE_DIAGONAL);
        expect(component.status).toEqual(Status.RESIZE_DIAGONAL);

        component.setStatus(Status.RESIZE_HORIZONTAL);
        expect(component.status).toEqual(Status.RESIZE_HORIZONTAL);

        component.setStatus(Status.RESIZE_VERTICAL);
        expect(component.status).toEqual(Status.RESIZE_VERTICAL);
    });

    it('#resize resize-container should resize with the appropriate dimensions', () => {
        component.setStatus(Status.RESIZE_DIAGONAL);
        const EXPECTED_WIDTH = mouseEventClick.pageX - SIDE_BAR_SIZE - component.MOUSE_OFFSET;
        const EXPECTED_HEIGHT = mouseEventClick.pageY - component.MOUSE_OFFSET;
        component.resize(mouseEventClick);
        expect(component.width).toEqual(EXPECTED_WIDTH);
        expect(component.height).toEqual(EXPECTED_HEIGHT);
    });

    it('#resize should not resize if position is under 250px', () => {
        component.width = 1;
        component.height = 1;
        component.status = Status.RESIZE_DIAGONAL;
        const mouseEventUnder250px = { pageX: DEFAULT_WIDTH - SIDE_BAR_SIZE, pageY: DEFAULT_HEIGHT, button: 0 } as MouseEvent;
        component.resize(mouseEventUnder250px);
        expect(component.width).toEqual(1);
        expect(component.height).toEqual(1);
    });

    it('#resize should resize when status is something else than NOT_RESIZING', () => {
        const calledResizeFunction: jasmine.Spy = spyOn(component, 'resize');
        component.status = Status.RESIZE_DIAGONAL;
        window.dispatchEvent(new MouseEvent('mousemove'));
        expect(calledResizeFunction).toHaveBeenCalled();
    });

    it('#resize should not resize when status is NOT_RESIZING', () => {
        const calledResizeFunction: jasmine.Spy = spyOn(component, 'resize');
        component.status = Status.NOT_RESIZING;
        window.dispatchEvent(new MouseEvent('mousemove'));
        expect(calledResizeFunction).not.toHaveBeenCalled();
    });

    it('#resizeCanvas should resize the canvas surface', () => {
        const boxSize = { widthBox: 1, heightBox: 1 };
        component.resizeCanvas(boxSize.widthBox, boxSize.heightBox);
        expect(component.width).toEqual(boxSize.widthBox);
        expect(component.height).toEqual(boxSize.heightBox);
        expect(drawingServiceSpyObj.onSizeChange).toHaveBeenCalledWith(boxSize);
    });

    it('#listenToResizeNotifications should receive a message from suscriber', () => {
        const newDrawingNotificationSpy: jasmine.Spy = spyOn(component, 'resizeNotification');
        component.listenToResizeNotifications();
        const boxSize: BoxSize = { widthBox: 1, heightBox: 1 };
        drawingServiceSpyObj.sendNotifToResize(boxSize);
        expect(newDrawingNotificationSpy).toHaveBeenCalledWith(boxSize);
    });

    it('#resizeNotification creating new drawing should resize to minimum size if under minimum workspace size ', () => {
        const UNDERMINIMUM_SCREEN_SIZE = 400;
        const resizeCanvasSpy = spyOn(component, 'resizeCanvas');
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: UNDERMINIMUM_SCREEN_SIZE });
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: UNDERMINIMUM_SCREEN_SIZE });

        const boxSize: BoxSize = { widthBox: -1, heightBox: -1 };
        const expectedBoxSize = { widthBox: DEFAULT_WIDTH, heightBox: DEFAULT_HEIGHT };
        component.resizeNotification(boxSize);
        expect(resizeCanvasSpy).toHaveBeenCalledWith(expectedBoxSize.widthBox, expectedBoxSize.heightBox);
    });

    it(
        '#resizeNotification creating a new drawing with a screen' +
            'over minimum workspace size should create a new drawing with 50% of the surface',
        () => {
            const OVERMINIMUM_WORKSPACE_SIZE = 1000;
            Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: OVERMINIMUM_WORKSPACE_SIZE });
            Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: OVERMINIMUM_WORKSPACE_SIZE });

            const resizeCanvasSpy = spyOn(component, 'resizeCanvas');
            const boxSize: BoxSize = { widthBox: -1, heightBox: -1 };
            const expectedBoxSize: BoxSize = {
                widthBox: (window.innerWidth - SIDE_BAR_SIZE) * HALF_RATIO,
                heightBox: window.innerHeight * HALF_RATIO,
            };
            component.setStatus(Status.RESIZE_DIAGONAL);
            component.resizeNotification(boxSize);
            expect(resizeCanvasSpy).toHaveBeenCalledWith(expectedBoxSize.widthBox, expectedBoxSize.heightBox);
        },
    );

    it('#onMouseUp container should send a a command to undo-redo service', () => {
        component.setStatus(Status.RESIZE_DIAGONAL);
        component.currentBoxSize = { widthBox: 1, heightBox: 1 };
        component.onMouseUpContainer();
        expect(undoRedoServiceSpyObj.addCommand).toHaveBeenCalled();
    });

    it('#WindowWidthIsOverMinimum should return true if width size of workspace is over 500', () => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: OVER_MINIMUM_X_COORDINATE });
        expect(component.workspaceWidthIsOverMinimum()).toBeTrue();
    });

    it('#WindowHeightIsOverMinimum should return true if height size of workspace is over 500', () => {
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: OVER_MINIMUM_Y_COORDINATE });
        expect(component.workspaceHeightIsOverMinimum()).toBeTrue();
    });

    it('#WindowWidthIsOverMinimum should not resize the canvas to the minimum value if the width of the window is less than 500', () => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: UNDER_MINIMUM_X_COORDINATE });
        expect(component.workspaceWidthIsOverMinimum()).toBeFalse();
    });

    it('#WindowHeightIsOverMinimum should not resize the canvas to the minimum value if the height of the window is less than 500', () => {
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: UNDER_MINIMUM_Y_COORDINATE });
        expect(component.workspaceHeightIsOverMinimum()).toBeFalse();
    });

    it('#XisOverMinimum X mouse coordinate under the minimum should not be allowed', () => {
        component.status = Status.RESIZE_DIAGONAL;
        const mouseEvent = { pageX: UNDER_MINIMUM_X_COORDINATE, pageY: UNDER_MINIMUM_Y_COORDINATE, button: 0 } as MouseEvent;
        expect(component.xCoordinateisOverMinimum(mouseEvent)).toBeFalse();
    });

    it('#YisOverMinimum Y mouse coordinate under the minimum should not be allowed', () => {
        component.status = Status.RESIZE_DIAGONAL;
        const mouseEvent = { pageX: UNDER_MINIMUM_X_COORDINATE, pageY: UNDER_MINIMUM_Y_COORDINATE, button: 0 } as MouseEvent;
        expect(component.yCoordinateIsOverMinimum(mouseEvent)).toBeFalse();
    });

    it('#XisOverMinimum X mouse coordinate over the minimum should be allowed', () => {
        const mouseEvent = { pageX: OVER_MINIMUM_X_COORDINATE, pageY: OVER_MINIMUM_Y_COORDINATE, button: 0 } as MouseEvent;
        expect(component.xCoordinateisOverMinimum(mouseEvent)).toBeTrue();
    });

    it('#YisOverMinimum Y mouse coordinate over the minimum should be allowed', () => {
        const mouseEvent = { pageX: OVER_MINIMUM_X_COORDINATE, pageY: OVER_MINIMUM_Y_COORDINATE, button: 0 } as MouseEvent;
        expect(component.yCoordinateIsOverMinimum(mouseEvent)).toBeTrue();
    });

    it('#UpdateWidthValid and #UpdateHeightValid should allow resize according to the status ', () => {
        component.status = Status.NOT_RESIZING;
        expect(component.updateWidthValid(mouseEventClick)).toBeFalse();
        expect(component.updateHeightValid(mouseEventClick)).toBeFalse();

        component.status = Status.RESIZE_DIAGONAL;
        expect(component.updateWidthValid(mouseEventClick)).toBeTrue();
        expect(component.updateHeightValid(mouseEventClick)).toBeTrue();

        component.status = Status.RESIZE_HORIZONTAL;
        expect(component.updateWidthValid(mouseEventClick)).toBeTrue();
        expect(component.updateHeightValid(mouseEventClick)).toBeFalse();

        component.status = Status.RESIZE_VERTICAL;
        expect(component.updateWidthValid(mouseEventClick)).toBeFalse();
        expect(component.updateHeightValid(mouseEventClick)).toBeTrue();
    });
});
