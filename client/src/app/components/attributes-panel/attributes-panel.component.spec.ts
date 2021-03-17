import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawingTool } from '@app/classes/drawing-tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from '@app/services/tools/line/line.service';
import { EllipseDrawingService } from '@app/services/tools/shape/ellipse/ellipse-drawing.service';
import { PolygonService } from '@app/services/tools/shape/polygon/polygon.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { of } from 'rxjs';
import { AttributesPanelComponent } from './attributes-panel.component';

describe('AttributesPanelComponent', () => {
    let component: AttributesPanelComponent;
    let fixture: ComponentFixture<AttributesPanelComponent>;

    let toolsService: ToolsService;

    const drawingTool: DrawingTool = new DrawingTool(new DrawingService(), new ColorService(), 'tool');

    const ellipseDrawingService: EllipseDrawingService = new EllipseDrawingService(
        new DrawingService(),
        new ColorService(),
        new UndoRedoService(new DrawingService()),
    );

    const polygonService: PolygonService = new PolygonService(new DrawingService(), new ColorService(), new UndoRedoService(new DrawingService()));

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

    it('#shapeIsActive should verify that a shape is active', () => {
        component.currentTool = ellipseDrawingService;
        expect(component.shapeIsActive()).toBeTrue();
    });

    it('#polygonIsActive should verify if the Polygon shape is active', () => {
        component.currentTool = polygonService;
        expect(component.polygonIsActive()).toBeTrue();
    });

    it('#needsTraceThickness should verify that the tool needs a thickness', () => {
        component.currentTool = drawingTool;
        expect(component.needsTraceThickness()).toBeTrue();
        component.currentTool = toolsService.sprayCanService;
        expect(component.needsTraceThickness()).toBeFalse();
    });
});
