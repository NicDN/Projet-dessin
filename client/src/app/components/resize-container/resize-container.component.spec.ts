import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SIDE_BAR_SIZE } from '@app/components/drawing/drawing.component';
import { ResizeContainerComponent, Status } from './resize-container.component';

fdescribe('ResizeContainerComponent', () => {
    let component: ResizeContainerComponent;
    let fixture: ComponentFixture<ResizeContainerComponent>;

    const OVER_MINIMUM_X = 800;
    const OVER_MINIMUM_Y = 800;
    const mouseEventClick = { pageX: OVER_MINIMUM_X, pageY: OVER_MINIMUM_Y, button: 0 } as MouseEvent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ResizeContainerComponent],
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

    it('should resize according to the status ', () => {
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
});
