import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawingTool } from '@app/classes/drawing-tool';
import { Shape, TraceType } from '@app/classes/shape';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from '@app/services/tools/drawing-tool/line/line.service';
import { EllipseDrawingService } from '@app/services/tools/shape/ellipse/ellipse-drawing.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { of } from 'rxjs';
import { AttributesPanelComponent } from './attributes-panel.component';

describe('AttributesPanelComponent', () => {
    let component: AttributesPanelComponent;
    let fixture: ComponentFixture<AttributesPanelComponent>;

    let toolsService: ToolsService;

    const drawingTool: DrawingTool = new DrawingTool(new DrawingService(), new ColorService(), 'tool');
    const lineService: LineService = new LineService(new DrawingService(), new ColorService());
    const ellipseDrawingService: EllipseDrawingService = new EllipseDrawingService(new DrawingService(), new ColorService());

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AttributesPanelComponent],
            providers: [ToolsService],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AttributesPanelComponent);
        component = fixture.componentInstance;
        toolsService = TestBed.inject(ToolsService);
        component.currentTool = new DrawingTool(new DrawingService(), new ColorService(), 'drawing tool for testing');
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('the getCurrentTool subscribed method assings current tool correctly ', async(() => {
        const expectedCurrentTool = new LineService(new DrawingService(), new ColorService());
        spyOn(toolsService, 'getCurrentTool').and.returnValue(of(expectedCurrentTool));
        component.getCurrentTool();
        fixture.detectChanges();
        expect(component.currentTool).toBe(expectedCurrentTool);
    }));

    it('should set the thickness correctly', () => {
        // should I test negative case knowing that the thickness comes from a slider that is never negative?
        const EXPECTED_THICKNESS = 10;
        component.setThickness(EXPECTED_THICKNESS);
        expect((component.currentTool as DrawingTool).thickness).toBe(EXPECTED_THICKNESS);
    });

    it('should set the trace type correctly', () => {
        // should i just check that the function is called ?
        component.currentTool = ellipseDrawingService;
        const expectedTraceType: TraceType = TraceType.Bordered;
        component.setTraceType(expectedTraceType);
        expect((component.currentTool as Shape).traceType).toBe(expectedTraceType);
    });

    it('should set the line junction diameter correctly', () => {
        // should i just check that the function is called ?
        component.currentTool = lineService;
        const EXPECTED_LINE_DIAMETER = 10;
        component.setLineJunctionDiameter(EXPECTED_LINE_DIAMETER);
        expect((component.currentTool as LineService).junctionDiameter).toBe(EXPECTED_LINE_DIAMETER);
    });

    it('should set the type of line junction correctly', () => {
        component.currentTool = lineService;
        const expectedJunction = false;
        (component.currentTool as LineService).drawWithJunction = !expectedJunction;
        component.setJunctionChecked(expectedJunction);
        expect((component.currentTool as LineService).drawWithJunction).toBe(expectedJunction);
    });

    it('should verify that a shape is active', () => {
        component.currentTool = ellipseDrawingService;
        expect(component.shapeIsActive()).toBe(true);
    });

    it('should verify that a line is active', () => {
        component.currentTool = lineService;
        expect(component.lineIsActive()).toBe(true);
    });

    it('should verify that a drawing tool is active', () => {
        component.currentTool = drawingTool;
        expect(component.drawingToolIsActive()).toBe(true);
    });
});
