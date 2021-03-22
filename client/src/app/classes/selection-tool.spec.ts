import { TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { CanvasTestHelper } from './canvas-test-helper';
import { SelectionPropreties } from './commands/selection-command/selection-command';
import { SelectionTool } from './selection-tool';
import { HORIZONTAL_OFFSET, MouseButton, VERTICAL_OFFSET } from './tool';
import { Vec2 } from './vec2';

export class SelectionToolStub extends SelectionTool {
    drawPerimeter(ctx: CanvasRenderingContext2D, begin: Vec2, end: Vec2): void {
        throw new Error('Method not implemented.');
    }
    drawSelection(selectionPropreties: SelectionPropreties): void {
        throw new Error('Method not implemented.');
    }
    fillWithWhite(selectionPropreties: SelectionPropreties): void {
        throw new Error('Method not implemented.');
    }
    constructor(drawingService: DrawingService, rectangleDrawingService: RectangleDrawingService, undoRedoService: UndoRedoService) {
        super(drawingService, rectangleDrawingService, 'Stub', undoRedoService);
    }
}

// tslint:disable: no-string-literal
describe('SelectionTool', () => {
    let selectionTool: SelectionTool;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let rectangleDrawingServiceSpyObj: jasmine.SpyObj<RectangleDrawingService>;
    let undoRedoSpyObj: jasmine.SpyObj<UndoRedoService>;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    const MOUSE_POSITION: Vec2 = { x: 25, y: 25 };
    const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
    const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 20 };
    const BOTTOM_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 20 };
    const TOP_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 0 };
    const LEFT_BUTTON_PRESSED = 1;
    const NO_BUTTON_PRESSED = 0;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        rectangleDrawingServiceSpyObj = jasmine.createSpyObj('RectangleDrawingService', []);
        undoRedoSpyObj = jasmine.createSpyObj('UndoRedoService', []);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: RectangleDrawingService, useValue: rectangleDrawingServiceSpyObj },
                { provide: UndoRedoService, useValue: undoRedoSpyObj },
            ],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        selectionTool = new SelectionToolStub(drawingServiceSpyObj, rectangleDrawingServiceSpyObj, undoRedoSpyObj);

        selectionTool['drawingService'].baseCtx = baseCtxStub;
        selectionTool['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            pageX: MOUSE_POSITION.x + HORIZONTAL_OFFSET,
            pageY: MOUSE_POSITION.y + VERTICAL_OFFSET,
            button: MouseButton.Left,
            buttons: LEFT_BUTTON_PRESSED,
        } as MouseEvent;
    });

    it('#onMouseDown should set mouseDown property to true if leftClick', () => {
        selectionTool.onMouseDown(mouseEvent);
        expect(selectionTool.mouseDown).toBeTrue();
    });

    it('#onMouseDown should not set mouseDown property to true if rightClick', () => {
        mouseEvent = {
            pageX: MOUSE_POSITION.x + HORIZONTAL_OFFSET,
            pageY: MOUSE_POSITION.y + VERTICAL_OFFSET,
            button: MouseButton.Right,
        } as MouseEvent;
        selectionTool.onMouseDown(mouseEvent);
        expect(selectionTool.mouseDown).toBeFalse();
    });
});
