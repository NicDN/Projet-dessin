import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
// import { DEFAULT_SIZE, HALF_RATIO, MINIMUM_WORKSPACE_SIZE, SIDE_BAR_SIZE } from '@app/components/drawing/drawing.component';
import { ResizeContainerComponent, Status } from './resize-container.component';

fdescribe('ResizeContainerComponent', () => {
    let component: ResizeContainerComponent;
    let fixture: ComponentFixture<ResizeContainerComponent>;
    const OVER_MINIMUM_X = 800;
    const OVER_MINIMUM_Y = 800;
    const mouseEventClick = { pageX: OVER_MINIMUM_X, pageY: OVER_MINIMUM_Y, button: 0 } as MouseEvent;
    // let drawingComponent: DrawingComponent;
    // let drawingFixture: ComponentFixture<DrawingComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ResizeContainerComponent, DrawingComponent],
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
        component.setStatus(mouseEventClick, Status.RESIZE_DIAGONAL);
        component.newDrawingNotification();
        expect(emitResizeNewDrawing).toHaveBeenCalled();
        expect(emitUsingButton).toHaveBeenCalled();
    });

    it('should set status', () => {
        component.setStatus(mouseEventClick, Status.NOT_RESIZING);
        expect(component.status).toEqual(Status.NOT_RESIZING);

        component.setStatus(mouseEventClick, Status.RESIZE_DIAGONAL);
        expect(component.status).toEqual(Status.RESIZE_DIAGONAL);

        component.setStatus(mouseEventClick, Status.RESIZE_HORIZONTAL);
        expect(component.status).toEqual(Status.RESIZE_HORIZONTAL);

        component.setStatus(mouseEventClick, Status.RESIZE_VERTICAL);
        expect(component.status).toEqual(Status.RESIZE_VERTICAL);
    });
});
