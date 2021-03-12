import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Tool } from '@app/classes/tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { ToolsService } from '@app/services/tools/tools.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { ToolBarComponent } from './tool-bar.component';

describe('ToolBarComponent', () => {
    let component: ToolBarComponent;
    let fixture: ComponentFixture<ToolBarComponent>;
    let toolsService: ToolsService;
    let undoRedoServiceStub: UndoRedoService;
    let tool: Tool;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ToolBarComponent],
            providers: [ToolsService, { provide: UndoRedoService, useValue: undoRedoServiceStub }],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        undoRedoServiceStub = TestBed.inject(UndoRedoService);
        tool = new PencilService(new DrawingService(), new ColorService(), undoRedoServiceStub);
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
