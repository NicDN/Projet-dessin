import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { SelectionType } from '@app/classes/commands/selection-command/selection-command';
import { ClipboardSelectionService } from '@app/services/clipboard-selection/clipboard-selection.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseSelectionService } from '@app/services/tools/selection/ellipse/ellipse-selection.service';
import { LassoSelectionService } from '@app/services/tools/selection/lasso/lasso-selection.service';
import { MoveSelectionService } from '@app/services/tools/selection/move-selection.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle/rectangle-selection.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { SelectionOptionsComponent } from './selection-options.component';

describe('SelectionOptionsComponent', () => {
    let component: SelectionOptionsComponent;
    let fixture: ComponentFixture<SelectionOptionsComponent>;

    let toolServiceSpyObj: jasmine.SpyObj<ToolsService>;
    let clipboardSelectionServiceSpyObj: jasmine.SpyObj<ClipboardSelectionService>;

    let rectangleSelectionServiceSpyObj: jasmine.SpyObj<RectangleSelectionService>;

    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let rectangleDrawingServiceSpyObj: jasmine.SpyObj<RectangleDrawingService>;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;
    let moveSelectionService: jasmine.SpyObj<MoveSelectionService>;

    let rectangleSelectionServiceStub: RectangleSelectionService;
    let ellipseSelectionServiceStub: EllipseSelectionService;
    let lassoSelectionServiceStub: LassoSelectionService;

    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let imageStub: ImageData;

    beforeEach(async(() => {
        toolServiceSpyObj = jasmine.createSpyObj('ToolsService', ['setCurrentTool']);
        clipboardSelectionServiceSpyObj = jasmine.createSpyObj('ClipboardSelectionService', ['']);

        rectangleSelectionServiceSpyObj = jasmine.createSpyObj('RectangleSelectionService', ['selectAll']);
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['fillWithWhite', 'clearCanvas']);
        rectangleDrawingServiceSpyObj = jasmine.createSpyObj('RectangleDrawingService', ['']);
        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', ['disableUndoRedo']);
        moveSelectionService = jasmine.createSpyObj('MoveSelectionService', ['']);

        TestBed.configureTestingModule({
            declarations: [SelectionOptionsComponent],
            providers: [
                { provide: RectangleSelectionService, useValue: rectangleSelectionServiceSpyObj },
                { provide: ToolsService, useValue: toolServiceSpyObj },
                { provide: ClipboardSelectionService, useValue: clipboardSelectionServiceSpyObj },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionOptionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        rectangleSelectionServiceStub = new RectangleSelectionService(
            drawingServiceSpyObj,
            rectangleDrawingServiceSpyObj,
            undoRedoServiceSpyObj,
            moveSelectionService,
        );

        ellipseSelectionServiceStub = new EllipseSelectionService(
            drawingServiceSpyObj,
            rectangleDrawingServiceSpyObj,
            undoRedoServiceSpyObj,
            moveSelectionService,
        );

        lassoSelectionServiceStub = new LassoSelectionService(
            drawingServiceSpyObj,
            rectangleDrawingServiceSpyObj,
            undoRedoServiceSpyObj,
            moveSelectionService,
        );
        toolServiceSpyObj.rectangleSelectionService = rectangleSelectionServiceStub;
        toolServiceSpyObj.ellipseSelectionService = ellipseSelectionServiceStub;
        toolServiceSpyObj.lassoSelectionService = lassoSelectionServiceStub;
        toolServiceSpyObj.currentTool = toolServiceSpyObj.rectangleSelectionService;

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        baseCtxStub.fillRect(0, 0, 1, 1);
        imageStub = baseCtxStub.getImageData(0, 0, 1, 1);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#selectionIsActive should return true if there is a selection in process', () => {
        rectangleSelectionServiceStub.selectionExists = false;
        expect(component.selectionIsActive()).toBeFalse();
    });

    it('#selectAll should change the current tool to rectangleSelectionService', () => {
        component.selectAll();
        expect(toolServiceSpyObj.setCurrentTool).toHaveBeenCalled();
        expect(toolServiceSpyObj.currentTool).toBe(toolServiceSpyObj.rectangleSelectionService);
    });

    it('#selectAll should call the select all method from rectangle selection service', () => {
        component.selectAll();
        expect(rectangleSelectionServiceSpyObj.selectAll).toHaveBeenCalled();
    });

    it('# can paste should return false if the clipboard is undefined', () => {
        let undefined: any;
        clipboardSelectionServiceSpyObj.clipBoardData = undefined;
        expect(component.canPaste()).toBeFalse();
    });

    it('#can paste should return true if the clipboard is defined', () => {
        clipboardSelectionServiceSpyObj.clipBoardData = {
            clipboardImage: imageStub,
            selectionType: SelectionType.Rectangle,
        };
        expect(component.canPaste()).toBeTrue();
    });
});
