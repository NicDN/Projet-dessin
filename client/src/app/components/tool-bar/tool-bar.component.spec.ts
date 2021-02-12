import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Tool } from '@app/classes/tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/drawing-tool/pencil/pencil-service';
import { ToolsService } from '@app/services/tools/tools.service';
import { ToolBarComponent } from './tool-bar.component';

describe('ToolBarComponent', () => {
    let component: ToolBarComponent;
    let fixture: ComponentFixture<ToolBarComponent>;
    const tool: Tool = new PencilService(new DrawingService(), new ColorService());
    let toolsService: ToolsService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ToolBarComponent],
            providers: [ToolsService],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ToolBarComponent);
        component = fixture.componentInstance;
        toolsService = TestBed.inject(ToolsService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call #toggleActive when a tool bar element is clicked', () => {
        const toolBarElement = fixture.debugElement.query(By.css('.list-item'));
        spyOn(toolsService, 'setCurrentTool');
        toolBarElement.triggerEventHandler('click', tool);
        expect(toolsService.setCurrentTool).toHaveBeenCalledWith(tool);
    });
});
