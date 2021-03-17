import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Color } from '@app/classes/color';
import { DrawingToolPropreties, TraceToolType } from '@app/classes/commands/drawing-tool-command/drawing-tool-command';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DrawingToolService } from '@app/services/tools/drawing-tool/drawing-tool.service';
import { PencilService } from '@app/services/tools/drawing-tool/pencil/pencil.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { of } from 'rxjs';
import { ToolBarComponent } from './tool-bar.component';

describe('ToolBarComponent', () => {
    let component: ToolBarComponent;
    let fixture: ComponentFixture<ToolBarComponent>;
    let toolsService: ToolsService;
    let undoRedoServiceStub: UndoRedoService;
    let drawingToolServiceSpyObj: jasmine.SpyObj<DrawingToolService>;
    let tool: Tool;
    const pathStub: Vec2 = { x: 1, y: 1 };
    const pathArrayStub: Vec2[] = [pathStub, pathStub];
    const colorStub: Color = { rgbValue: 'red', opacity: 1 };

    const canvasStub: HTMLCanvasElement = document.createElement('canvas');
    let canvasCtxStub: CanvasRenderingContext2D;
    canvasCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;

    const drawingToolPropretiesStub: DrawingToolPropreties = {
        traceToolType: TraceToolType.Pencil,
        drawingContext: canvasCtxStub,
        drawingPath: pathArrayStub,
        drawingThickness: 1,
        drawingColor: colorStub,
        drawWithJunction: true,
        junctionDiameter: 1,
    };

    beforeEach(async(() => {
        drawingToolServiceSpyObj = jasmine.createSpyObj('DrawingToolService', [
            'listenToNewDrawingPencilNotifications',
            'listenToNewDrawingEraserNotifications',
            'listenToNewDrawingLineNotifications',
        ]);
        drawingToolServiceSpyObj.listenToNewDrawingPencilNotifications.and.returnValue(of(drawingToolPropretiesStub));
        drawingToolServiceSpyObj.listenToNewDrawingEraserNotifications.and.returnValue(of(drawingToolPropretiesStub));
        drawingToolServiceSpyObj.listenToNewDrawingLineNotifications.and.returnValue(of(drawingToolPropretiesStub));

        TestBed.configureTestingModule({
            declarations: [ToolBarComponent],
            providers: [
                ToolsService,
                { provide: UndoRedoService, useValue: undoRedoServiceStub },
                { provide: DrawingToolService, useValue: drawingToolServiceSpyObj },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        undoRedoServiceStub = TestBed.inject(UndoRedoService);
        tool = new PencilService(new DrawingService(), new ColorService(), undoRedoServiceStub, drawingToolServiceSpyObj);
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
        toolBarElement.triggerEventHandler('click', tool);
        expect(toolsService.currentTool).toBeInstanceOf(PencilService);
    });
});
