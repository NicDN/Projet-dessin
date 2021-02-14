import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, DrawingComponent, HALF_RATIO, SIDE_BAR_SIZE } from '@app/components/drawing/drawing.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeContainerComponent, Status } from './resize-container.component';

// tslint:disable: no-any
describe('ResizeContainerComponent', () => {
    let component: ResizeContainerComponent;
    let fixture: ComponentFixture<ResizeContainerComponent>;
    let drawingService: DrawingService;
    let drawingFixture: ComponentFixture<DrawingComponent>;

    const OVER_MINIMUM_X_COORDINATE = 800;
    const OVER_MINIMUM_Y_COORDINATE = 800;
    const UNDER_MINIMUM_X_COORDINATE = 600;
    const UNDER_MINIMUM_Y_COORDINATE = 200;
    const mouseEventClick = { pageX: OVER_MINIMUM_X_COORDINATE, pageY: OVER_MINIMUM_Y_COORDINATE, button: 0 } as MouseEvent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ResizeContainerComponent, DrawingComponent],
            providers: [DrawingService],
            imports: [RouterTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        drawingService = TestBed.inject(DrawingService);
        fixture = TestBed.createComponent(ResizeContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#onMouseDown should emit a signal to drawing one of the control points is being used', () => {
        drawingFixture = TestBed.createComponent(DrawingComponent);
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
        drawingFixture = TestBed.createComponent(DrawingComponent);
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

    it('#onMouseUpContainer should send a notify input if the status is NOT_RESIZING', () => {
        drawingFixture = TestBed.createComponent(DrawingComponent);
        component.setStatus(Status.RESIZE_DIAGONAL);
        const emitResizeNewDrawing: jasmine.Spy = spyOn(component.notifyResize, 'emit');
        component.onMouseUpContainer(mouseEventClick);
        expect(emitResizeNewDrawing).toHaveBeenCalled();
    });

    it('#onMouseUpContainer should put the status back to NOT_RESIZING', () => {
        drawingFixture = TestBed.createComponent(DrawingComponent);
        component.setStatus(Status.NOT_RESIZING);
        component.onMouseUpContainer(mouseEventClick);
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

    it('#resize resize-container should resize with the good dimensions', () => {
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

    it('#listenToNewDrawingNotifications should receive a message from suscriber', () => {
        drawingFixture = TestBed.createComponent(DrawingComponent);
        drawingFixture.detectChanges();
        const newDrawingNotificationSpy: jasmine.Spy = spyOn(component, 'newDrawingNotification');
        component.listenToNewDrawingNotifications();
        drawingService.sendNotifReload();
        fixture.detectChanges();
        expect(newDrawingNotificationSpy).toHaveBeenCalled();
    });

    it('#newDrawingNotification creating new drawing should resize to minimum size if under minimum workspace size ', () => {
        const MINIMUM_CANVAS_SIZE = 250;
        const UNDERMINIMUM_SCREEN_SIZE = 400;
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: UNDERMINIMUM_SCREEN_SIZE });
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: UNDERMINIMUM_SCREEN_SIZE });
        expect(component.WindowWidthIsOverMinimum()).toBeFalse();
        expect(component.WindowHeightIsOverMinimum()).toBeFalse();
        component.newDrawingNotification();
        expect(component.width).toEqual(MINIMUM_CANVAS_SIZE);
        expect(component.height).toEqual(MINIMUM_CANVAS_SIZE);
    });

    it('#newDrawingNotification creating a new drawing with a screen over minimum workspace size should create a new drawing with 50% of the surface', () => {
        const OVERMINIMUM_WORKSPACE_SIZE = 1000;
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: OVERMINIMUM_WORKSPACE_SIZE });
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: OVERMINIMUM_WORKSPACE_SIZE });
        expect(component.WindowWidthIsOverMinimum()).toBeTrue();
        expect(component.WindowHeightIsOverMinimum()).toBeTrue();
        component.newDrawingNotification();
        expect(component.width).toEqual((window.innerWidth - SIDE_BAR_SIZE) * HALF_RATIO);
        expect(component.height).toEqual(window.innerHeight * HALF_RATIO);
    });

    it('#WindowWidthIsOverMinimum should resize the canvas to the minimum value if the width of the window is less than 500', () => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1010 });
        // tslint:disable-next-line: no-unused-expression
        expect(component.WindowWidthIsOverMinimum()).toBeTrue;
    });

    it('#WindowHeightIsOverMinimum should resize the canvas to the minimum value if the width of the window is less than 500', () => {
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 601 });
        // tslint:disable-next-line: no-unused-expression
        expect(component.WindowHeightIsOverMinimum()).toBeTrue();
    });

    it('#WindowWidthIsOverMinimum should not resize the canvas to the minimum value if the width of the window is less than 500', () => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 600 });
        expect(component.WindowWidthIsOverMinimum()).toBeFalse();
    });

    it('#WindowHeightIsOverMinimum should not resize the canvas to the minimum value if the width of the window is less than 500', () => {
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 400 });
        expect(component.WindowHeightIsOverMinimum()).toBeFalse();
    });

    it('#XisOverMinimum X mouse coordinate under the minimum should not be allowed', () => {
        component.status = Status.RESIZE_DIAGONAL;
        const mouseEvent = { pageX: UNDER_MINIMUM_X_COORDINATE, pageY: UNDER_MINIMUM_Y_COORDINATE, button: 0 } as MouseEvent;
        expect(component.XisOverMinimum(mouseEvent)).toBeFalse();
    });

    it('#YisOverMinimum Y mouse coordinate under the minimum should not be allowed', () => {
        component.status = Status.RESIZE_DIAGONAL;
        const mouseEvent = { pageX: UNDER_MINIMUM_X_COORDINATE, pageY: UNDER_MINIMUM_Y_COORDINATE, button: 0 } as MouseEvent;
        expect(component.YisOverMinimum(mouseEvent)).toBeFalse();
    });

    it('#XisOverMinimum X mouse coordinate over the minimum should be allowed', () => {
        const mouseEvent = { pageX: OVER_MINIMUM_X_COORDINATE, pageY: OVER_MINIMUM_Y_COORDINATE, button: 0 } as MouseEvent;
        expect(component.XisOverMinimum(mouseEvent)).toBeTrue();
    });

    it('#YisOverMinimum Y mouse coordinate over the minimum should be allowed', () => {
        const mouseEvent = { pageX: OVER_MINIMUM_X_COORDINATE, pageY: OVER_MINIMUM_Y_COORDINATE, button: 0 } as MouseEvent;
        expect(component.YisOverMinimum(mouseEvent)).toBeTrue();
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
