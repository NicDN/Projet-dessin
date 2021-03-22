import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawingTool } from '@app/classes/drawing-tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from '@app/services/tools/line/line.service';
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
        component.currentTool = drawingTool;
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
        component.currentTool = polygonService;
        expect(component.shapeIsActive()).toBeTrue();
    });

    it('#polygonIsActive should verify if the Polygon shape is active', () => {
        component.currentTool = polygonService;
        expect(component.polygonIsActive()).toBeTrue();
    });

    it('#needsTraceThickness should verify that the tool needs a thickness', () => {
        expect(component.needsTraceThickness()).toBeTrue();
        component.currentTool = toolsService.sprayCanService;
        expect(component.needsTraceThickness()).toBeFalse();
    });

    it('thicknessSetting should call  #getAttribute correctly ', () => {
        const EXPECTED_THICKNESS = 10;
        (component.currentTool as DrawingTool).thickness = EXPECTED_THICKNESS;
        expect(component.thicknessSetting.getAttribute()).toBe(EXPECTED_THICKNESS);
    });

    it('polygonSetting should call  #getAttribute correctly ', () => {
        component.currentTool = polygonService;
        const EXPECTED_NUMBER_OF_SIDES = 10;
        (component.currentTool as PolygonService).numberOfSides = EXPECTED_NUMBER_OF_SIDES;
        expect(component.polygonSetting.getAttribute()).toBe(EXPECTED_NUMBER_OF_SIDES);
    });

    it('thicknessSetting should call  #action correctly ', () => {
        const EXPECTED_VALUE = 10;
        component.thicknessSetting.action(EXPECTED_VALUE);
        expect((component.currentTool as DrawingTool).thickness).toBe(EXPECTED_VALUE);
    });

    it('polygonSetting should call  #action correctly ', () => {
        const EXPECTED_VALUE = 10;
        component.polygonSetting.action(EXPECTED_VALUE);
        expect((component.currentTool as PolygonService).numberOfSides).toBe(EXPECTED_VALUE);
    });
});
