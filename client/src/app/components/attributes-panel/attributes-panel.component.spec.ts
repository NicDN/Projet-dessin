import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawingTool } from '@app/classes/drawing-tool';
import { Shape, TraceType } from '@app/classes/shape';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from '@app/services/tools/line/line.service';
import { EllipseDrawingService } from '@app/services/tools/shape/ellipse/ellipse-drawing.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { of } from 'rxjs';
import { AttributesPanelComponent } from './attributes-panel.component';

describe('AttributesPanelComponent', () => {
    let component: AttributesPanelComponent;
    let fixture: ComponentFixture<AttributesPanelComponent>;

    let toolsService: ToolsService;

    const drawingTool: DrawingTool = new DrawingTool(new DrawingService(), new ColorService(), 'tool');
    const lineService: LineService = new LineService(new DrawingService(), new ColorService(), new UndoRedoService(new DrawingService()));
    const ellipseDrawingService: EllipseDrawingService = new EllipseDrawingService(
        new DrawingService(),
        new ColorService(),
        new UndoRedoService(new DrawingService()),
    );

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AttributesPanelComponent],
            providers: [ToolsService],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
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

    it('#subscribe assings current tool correctly ', async(() => {
        const expectedCurrentTool = new LineService(new DrawingService(), new ColorService(), new UndoRedoService(new DrawingService()));
        spyOn(toolsService, 'getCurrentTool').and.returnValue(of(expectedCurrentTool));
        component.subscribe();
        fixture.detectChanges();
        expect(component.currentTool).toBe(expectedCurrentTool);
    }));

    it('#setThickness should set the thickness correctly', () => {
        const EXPECTED_THICKNESS = 10;
        component.setThickness(EXPECTED_THICKNESS);
        expect((component.currentTool as DrawingTool).thickness).toBe(EXPECTED_THICKNESS);
    });

    it('#setTraceType should set the trace type correctly', () => {
        component.currentTool = ellipseDrawingService;
        const expectedTraceType: TraceType = TraceType.Bordered;
        component.setTraceType(expectedTraceType);
        expect((component.currentTool as Shape).traceType).toBe(expectedTraceType);
    });

    it('#setLineJunctionDiameter should set the line junction diameter correctly', () => {
        component.currentTool = lineService;
        const EXPECTED_LINE_DIAMETER = 10;
        component.setLineJunctionDiameter(EXPECTED_LINE_DIAMETER);
        expect((component.currentTool as LineService).junctionDiameter).toBe(EXPECTED_LINE_DIAMETER);
    });

    it('#setJunctionChecked should set the type of line junction correctly', () => {
        component.currentTool = lineService;
        const expectedJunction = false;
        (component.currentTool as LineService).drawWithJunction = !expectedJunction;
        component.setJunctionChecked(expectedJunction);
        expect((component.currentTool as LineService).drawWithJunction).toBe(expectedJunction);
    });

    it('#shapeIsActive should verify that a shape is active', () => {
        component.currentTool = ellipseDrawingService;
        expect(component.shapeIsActive()).toBeTrue();
    });

    it('#needsTraceThickness should verify that the tool needs a thickness', () => {
        component.currentTool = drawingTool;
        expect(component.needsTraceThickness()).toBeTrue();
    });
});
