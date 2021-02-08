import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from '@app/services/tools/drawing-tool/line/line.service';
import { PencilService } from '@app/services/tools/drawing-tool/pencil/pencil-service';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { EllipseDrawingService } from '@app/services/tools/shape/ellipse/ellipse-drawing.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { DrawingComponent } from './drawing.component';

const HALF_RATIO = 0.5;
const SIDE_BAR_SIZE = 400;
const DEFAULT_WIDTH = (window.innerWidth - SIDE_BAR_SIZE) * HALF_RATIO;
const DEFAULT_HEIGHT = window.innerHeight * HALF_RATIO;

describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;
    // let toolStub: ToolStub;
    let drawingStub: DrawingService;
    // tslint:disable-next-line: prefer-const
    let toolsService: ToolsService;
    // let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    beforeEach(async(() => {
        // toolStub = new ToolStub({} as DrawingService);
        drawingStub = new DrawingService();
        //  drawingServiceSpy = jasmine.createSpyObj('drawingService', ['test']);
        toolsService = new ToolsService(
            {} as PencilService,
            {} as EllipseDrawingService,
            {} as RectangleDrawingService,
            {} as LineService,
            {} as EraserService,
        );
        TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            providers: [
                { provide: ToolsService, useValue: toolsService },
                { provide: DrawingService, useValue: drawingStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        // drawingServiceSpy.test.and.returnValue.
    });

    it('should have a default WIDTH and HEIGHT', () => {
        const height = component.height;
        const width = component.width;
        expect(height).toEqual(DEFAULT_HEIGHT);
        expect(width).toEqual(DEFAULT_WIDTH);
    });

    it('Should disable drawing if the resize button is being used', () => {
        const isUsingResizeButtonStub = true;
        component.disableDrawing(isUsingResizeButtonStub);
        expect(component.canDraw).toEqual(false);

        component.disableDrawing(!isUsingResizeButtonStub);
        expect(component.canDraw).toEqual(true);
    });

    // it('should get stubTool', () => {
    //     // const currentTool = component.currentTool;
    //     const currentTool = toolsService.currentTool;
    //     expect(currentTool).toEqual(toolStub);
    // });

    /*it(" should call the tool's mouse move when receiving a mouse move event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolStub, 'onMouseMove').and.callThrough();
        component.onMouseMove(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });*/

    /*it(" should call the tool's mouse down when receiving a mouse down event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolStub, 'onMouseDown').and.callThrough();
        component.onMouseDown(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });*/

    /*it(" should call the tool's mouse up when receiving a mouse up event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolStub, 'onMouseUp').and.callThrough();
        component.onMouseUp(event);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });
    */
});
