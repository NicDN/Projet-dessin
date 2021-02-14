import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DEFAULT_WIDTH, DEFAULT_HEIGHT, DrawingComponent, HALF_RATIO, SIDE_BAR_SIZE } from '@app/components/drawing/drawing.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeContainerComponent, Status } from './resize-container.component';

describe('ResizeContainerComponent', () => {
    let component: ResizeContainerComponent;
    let fixture: ComponentFixture<ResizeContainerComponent>;
    let drawingService: DrawingService;
    let drawingFixture: ComponentFixture<DrawingComponent>;

    const OVER_MINIMUM_X = 800;
    const OVER_MINIMUM_Y = 800;
    const mouseEventClick = { pageX: OVER_MINIMUM_X, pageY: OVER_MINIMUM_Y, button: 0 } as MouseEvent;

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

    it('should not resize width if mouse coodinates are under the minimum', () => {
        const UNDER_MINIMUM_X = 600;
        const UNDER_MINIMUM_Y = 200;
        component.status = Status.RESIZE_DIAGONAL;

        let mouseEvent = { pageX: UNDER_MINIMUM_X, pageY: UNDER_MINIMUM_Y, button: 0 } as MouseEvent;
        expect(component.XisOverMinimum(mouseEvent)).toEqual(false);
        expect(component.YisOverMinimum(mouseEvent)).toEqual(false);

        mouseEvent = { pageX: OVER_MINIMUM_X, pageY: OVER_MINIMUM_Y, button: 0 } as MouseEvent;
        expect(component.XisOverMinimum(mouseEvent)).toEqual(true);
        expect(component.YisOverMinimum(mouseEvent)).toEqual(true);
    });

    it('should enable resize according to the status ', () => {
        component.status = Status.NOT_RESIZING;
        expect(component.updateWidthValid(mouseEventClick)).toEqual(false);

        component.status = Status.RESIZE_DIAGONAL;
        expect(component.updateWidthValid(mouseEventClick)).toEqual(true);
        expect(component.updateHeightValid(mouseEventClick)).toEqual(true);

        component.status = Status.RESIZE_HORIZONTAL;
        expect(component.updateWidthValid(mouseEventClick)).toEqual(true);
        expect(component.updateHeightValid(mouseEventClick)).toEqual(false);

        component.status = Status.RESIZE_VERTICAL;
        expect(component.updateWidthValid(mouseEventClick)).toEqual(false);
        expect(component.updateHeightValid(mouseEventClick)).toEqual(true);
    });

    it('should notify drawing component to resize ', () => {
        drawingFixture = TestBed.createComponent(DrawingComponent);
        const emitResizeNewDrawing: jasmine.Spy = spyOn(component.notifyResize, 'emit');
        const emitUsingButton: jasmine.Spy = spyOn(component.usingButton, 'emit');
        component.onMouseDown(mouseEventClick, Status.RESIZE_DIAGONAL);
        component.newDrawingNotification();
        expect(emitResizeNewDrawing).toHaveBeenCalled();
        expect(emitUsingButton).toHaveBeenCalled();
    });

    it('should set status', () => {
        component.setStatus(Status.NOT_RESIZING);
        expect(component.status).toEqual(Status.NOT_RESIZING);

        component.setStatus(Status.RESIZE_DIAGONAL);
        expect(component.status).toEqual(Status.RESIZE_DIAGONAL);

        component.setStatus(Status.RESIZE_HORIZONTAL);
        expect(component.status).toEqual(Status.RESIZE_HORIZONTAL);

        component.setStatus(Status.RESIZE_VERTICAL);
        expect(component.status).toEqual(Status.RESIZE_VERTICAL);
    });

    it('should not resize on mouse up only if status was not NOT_RESIZING and vice-versa', () => {
        const emitResizeNewDrawing: jasmine.Spy = spyOn(component.notifyResize, 'emit');
        component.status = Status.NOT_RESIZING;
        component.onMouseUpContainer(mouseEventClick);
        expect(emitResizeNewDrawing).not.toHaveBeenCalled();

        component.status = Status.RESIZE_DIAGONAL;
        component.onMouseUpContainer(mouseEventClick);
        expect(emitResizeNewDrawing).toHaveBeenCalled();
    });

    it('should resize with the good dimensions', () => {
        component.setStatus(Status.RESIZE_DIAGONAL);
        const EXPECTED_WIDTH = mouseEventClick.pageX - SIDE_BAR_SIZE - component.MOUSE_OFFSET;
        const EXPECTED_HEIGHT = mouseEventClick.pageY - component.MOUSE_OFFSET;
        component.resize(mouseEventClick);
        expect(component.width).toEqual(EXPECTED_WIDTH);
        expect(component.height).toEqual(EXPECTED_HEIGHT);
    });

    it('should not resize if position is under 250px', () => {
        component.width = 1;
        component.height = 1;
        component.status = Status.RESIZE_DIAGONAL;
        const mouseEventUnder250px = { pageX: DEFAULT_WIDTH - SIDE_BAR_SIZE, pageY: DEFAULT_HEIGHT, button: 0 } as MouseEvent;
        component.resize(mouseEventUnder250px);
        expect(component.width).toEqual(1);
        expect(component.height).toEqual(1);
    });

    it('should not resize when status is not NOT_RESIZING', () => {
        const calledResizeFunction: jasmine.Spy = spyOn(component, 'resize');
        component.status = Status.NOT_RESIZING;
        window.dispatchEvent(new MouseEvent('mousemove'));
        expect(calledResizeFunction).not.toHaveBeenCalled();

        component.status = Status.RESIZE_DIAGONAL;
        window.dispatchEvent(new MouseEvent('mousemove'));
        expect(calledResizeFunction).toHaveBeenCalled();
    });

    it('should call onMouseUpContainer on mouse up ', () => {
        const calledOnMouseUpContainerFunction: jasmine.Spy = spyOn(component, 'onMouseUpContainer');
        window.dispatchEvent(new MouseEvent('mouseup'));
        expect(calledOnMouseUpContainerFunction).toHaveBeenCalled();
    });

    it('should receive a message from suscriber', () => {
        drawingFixture = TestBed.createComponent(DrawingComponent);
        drawingFixture.detectChanges();

        const newDrawingNotificationSpy: jasmine.Spy = spyOn(component, 'newDrawingNotification');
        component.listenToNewDrawingNotifications();
        drawingService.sendNotifReload();
        fixture.detectChanges();
        expect(newDrawingNotificationSpy).toHaveBeenCalled();
    });

    it('should resize the canvas to the minimum value if the width of the window is less than 500', () => {
        // const windowWidth = window.innerWidth;
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 600 });
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 400 });
        expect(component.WindowWidthIsOverMinimum()).toEqual(false);
        expect(component.WindowHeightIsOverMinimum()).toEqual(false);
        component.newDrawingNotification();
        expect(component.width).toEqual(DEFAULT_WIDTH);
        expect(component.height).toEqual(DEFAULT_HEIGHT);

        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1010 });
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 601 });
        expect(component.WindowWidthIsOverMinimum()).toEqual(true);
        expect(component.WindowHeightIsOverMinimum()).toEqual(true);
        component.newDrawingNotification();
        expect(component.width).toEqual((window.innerWidth - SIDE_BAR_SIZE) * HALF_RATIO);
        expect(component.height).toEqual(window.innerHeight * HALF_RATIO);
    });
});
