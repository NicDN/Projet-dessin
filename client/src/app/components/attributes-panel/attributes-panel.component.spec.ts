import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { DrawingTool } from '@app/classes/drawing-tool';
// import { Tool } from '@app/classes/tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from '@app/services/tools/drawing-tool/line/line.service';
// import { ToolsService } from '@app/services/tools/tools.service';
// import { Observable } from 'rxjs';
import { AttributesPanelComponent } from './attributes-panel.component';

describe('AttributesPanelComponent', () => {
    let component: AttributesPanelComponent;
    let fixture: ComponentFixture<AttributesPanelComponent>;

    // let toolsService: ToolsService;
    let drawingTool: DrawingTool = new DrawingTool(new DrawingService(), new ColorService(), 'tool');
    let lineService: LineService = new LineService(new DrawingService(), new ColorService());

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AttributesPanelComponent],
            providers: [],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AttributesPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        // toolsService = TestBed.get(ToolsService);
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('subscribe method is getting called ', fakeAsync(() => {
        // let tool: Tool;
        // let toolSpy = spyOn(toolsService, 'getCurrentTool').and.returnValue(new Observable<Tool>());
        // let subSpy = spyOn(toolsService.getCurrentTool(), 'subscribe');
        // tick();
        // expect(toolSpy).toHaveBeenCalledBefore(subSpy);
        // expect(subSpy).toHaveBeenCalled();
    }));

    it('subscribe method assings current tool correctly ', fakeAsync(() => {
        // let tool: Tool;
        // let toolSpy = spyOn(toolsService, 'getCurrentTool').and.returnValue(new Observable<Tool>());
        // let subSpy = spyOn(toolsService.getCurrentTool(), 'subscribe');
        // tick();
        // expect(toolSpy).toHaveBeenCalledBefore(subSpy);
        // expect(subSpy).toHaveBeenCalled();
    }));

    it('should set the thickness correctly', () => {
        const EXPECTED_THICKNESS = 10;
        component.currentTool = drawingTool;
        component.setThickness(EXPECTED_THICKNESS);
        expect(drawingTool.thickness).toBe(EXPECTED_THICKNESS);
    });

    it('should set the trace type correctly', () => {});

    it('should set the line junction diameter correctly', () => {});

    it('should set the right type of line junction correctly', () => {});

    it('should verify that a shape is active', () => {});

    it('should verify that a line is active', () => {
        component.currentTool = lineService;
        const value = component.lineIsActive;
        expect(value).toBe(true);
    });

    it('should verify that a drawing tool is active', () => {
        component.currentTool = drawingTool;
        const value = component.drawingToolIsActive;
        expect(value).toBe(true);
    });
});
