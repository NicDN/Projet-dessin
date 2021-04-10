import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { EyeDropperService } from '@app/services/tools/eye-dropper/eye-dropper.service';
import { MoveSelectionService, SelectedPoint } from '@app/services/tools/selection/move-selection.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle/rectangle-selection.service';
import { ResizeSelectionService } from '@app/services/tools/selection/resize-selection.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextService } from '@app/services/tools/text/textService/text.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { LineService } from '@app/services/tools/trace-tool/line/line.service';
import { PencilService } from '@app/services/tools/trace-tool/pencil/pencil.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { LassoSelectionService } from './../../services/tools/selection/lasso/lasso-selection.service';
import { RectangleDrawingService } from './../../services/tools/shape/rectangle/rectangle-drawing.service';
import { EraserService } from './../../services/tools/trace-tool/eraser/eraser.service';
import { DrawingComponent } from './drawing.component';

const MOUSE_POSITION_DEFAULT = 1000;
const INSIDE_CANVAS_WIDTH = 500;
const INSIDE_CANVAS_HEIGHT = 500;
const mouseEventClick = { pageX: MOUSE_POSITION_DEFAULT, pageY: MOUSE_POSITION_DEFAULT, button: 0 } as MouseEvent;
const mouseEventInsideCanvas = { pageX: INSIDE_CANVAS_WIDTH, pageY: INSIDE_CANVAS_HEIGHT, button: 0 } as MouseEvent;
const keyBoardEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: true });
const OVER_MINIMUM_WIDTH = 1000;
const OVER_MINIMUM_HEIGHT = 1000;

const TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 0 };
const xFlipped_TOP_LEFT_CORNER_COORDS: Vec2 = { x: 80, y: 0 };
const yFlipped_TOP_LEFT_CORNER_COORDS: Vec2 = { x: 0, y: 80 };
const BOTTOM_RIGHT_CORNER_COORDS: Vec2 = { x: 40, y: 20 };

const coordsStub = {
    initialTopLeft: TOP_LEFT_CORNER_COORDS,
    initialBottomRight: BOTTOM_RIGHT_CORNER_COORDS,
    finalTopLeft: TOP_LEFT_CORNER_COORDS,
    finalBottomRight: BOTTOM_RIGHT_CORNER_COORDS,
};

const xFlippedCoordsStub = {
    initialTopLeft: TOP_LEFT_CORNER_COORDS,
    initialBottomRight: BOTTOM_RIGHT_CORNER_COORDS,
    finalTopLeft: xFlipped_TOP_LEFT_CORNER_COORDS,
    finalBottomRight: BOTTOM_RIGHT_CORNER_COORDS,
};

const yFlippedCoordsStub = {
    initialTopLeft: TOP_LEFT_CORNER_COORDS,
    initialBottomRight: BOTTOM_RIGHT_CORNER_COORDS,
    finalTopLeft: yFlipped_TOP_LEFT_CORNER_COORDS,
    finalBottomRight: BOTTOM_RIGHT_CORNER_COORDS,
};

const baseImage = new Image();

// tslint:disable: no-string-literal
// tslint:disable: no-any
describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;

    // tslint:disable-next-line: prefer-const
    let colorServiceStub: ColorService;
    let drawingStub: DrawingService;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;
    let moveSelectionServiceSpyObj: jasmine.SpyObj<MoveSelectionService>;
    let resizeSelectionSpyObj: jasmine.SpyObj<ResizeSelectionService>;
    let imageSpyObj: jasmine.SpyObj<HTMLImageElement>;
    let rectangleDrawingServiceSpyObj: jasmine.SpyObj<RectangleDrawingService>;
    let lassoSelectionServiceSpyObj: jasmine.SpyObj<LassoSelectionService>;
    let lineServiceSpyObj: jasmine.SpyObj<LineService>;
    let rectangleSelectionServiceSpyObj: jasmine.SpyObj<RectangleSelectionService>;
    let eyeDropperServiceSpyObj: jasmine.SpyObj<EyeDropperService>;
    let textServiceSpyObj: jasmine.SpyObj<TextService>;

    let hotKeyServiceSpy: jasmine.SpyObj<HotkeyService>;
    let toolsServiceSpy: jasmine.SpyObj<ToolsService>;

    const canvasMock = document.createElement('canvas');

    beforeEach(async(() => {
        drawingStub = new DrawingService({} as MatBottomSheet);

        toolsServiceSpy = jasmine.createSpyObj('ToolsService', ['onKeyUp']);
        hotKeyServiceSpy = jasmine.createSpyObj('HotkeyService', ['onKeyDown', 'onKeyUp']);
        undoRedoServiceSpyObj = jasmine.createSpyObj('undoRedoService', ['addCommand', 'enableUndoRedo', 'disableUndoRedo']);
        moveSelectionServiceSpyObj = jasmine.createSpyObj('MoveSelectionService', ['']);
        resizeSelectionSpyObj = jasmine.createSpyObj('ResizeSelectionService', ['']);
        rectangleDrawingServiceSpyObj = jasmine.createSpyObj('RectangleDrawingService', ['']);
        lassoSelectionServiceSpyObj = jasmine.createSpyObj('LassoSelectionService', ['checkIfLineCrossing']);
        lineServiceSpyObj = jasmine.createSpyObj('LineService', ['']);
        rectangleSelectionServiceSpyObj = jasmine.createSpyObj('RectangleSelectionService', ['']);
        eyeDropperServiceSpyObj = jasmine.createSpyObj('EyeDropperService', ['']);
        textServiceSpyObj = jasmine.createSpyObj('TextService', ['']);

        imageSpyObj = jasmine.createSpyObj('Image', ['decode']);

        TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            providers: [
                { provide: ToolsService, useValue: toolsServiceSpy },
                { provide: DrawingService, useValue: drawingStub },
                { provide: HotkeyService, useValue: hotKeyServiceSpy },
                { provide: ColorService, useValue: colorServiceStub },
                { provide: UndoRedoService, useValue: undoRedoServiceSpyObj },
                { provide: MoveSelectionService, useValue: moveSelectionServiceSpyObj },
                { provide: RectangleDrawingService, useValue: rectangleDrawingServiceSpyObj },
                { provide: RectangleSelectionService, useValue: rectangleSelectionServiceSpyObj },
                { provide: EyeDropperService, useValue: eyeDropperServiceSpyObj },
                { provide: TextService, useValue: textServiceSpyObj },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: OVER_MINIMUM_WIDTH });
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: OVER_MINIMUM_HEIGHT });

        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;

        colorServiceStub = TestBed.inject(ColorService);
        drawingStub = TestBed.inject(DrawingService);
        toolsServiceSpy.currentTool = new PencilService(drawingStub, colorServiceStub, undoRedoServiceSpyObj);

        localStorage.setItem('canvas', canvasMock.toDataURL());

        toolsServiceSpy.rectangleSelectionService = new RectangleSelectionService(
            drawingStub,
            rectangleDrawingServiceSpyObj,
            undoRedoServiceSpyObj,
            moveSelectionServiceSpyObj,
            resizeSelectionSpyObj,
        );

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#ngAfterViewInit should set the base context and preview context correctly', () => {
        component.ngAfterViewInit();
        expect(component['drawingService'].baseCtx).toBe(component.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D);
        expect(component['drawingService'].previewCtx).toBe(component.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D);
        expect(component['drawingService'].canvas).toBe(component.baseCanvas.nativeElement);
        expect(component['drawingService'].previewCanvas).toBe(component.previewCanvas.nativeElement);
    });

    it('#ngAfterViewInit should call #loadCanvasWithIncomingImage', () => {
        spyOn<any>(component, 'loadCanvasWithIncomingImage').and.stub();
        component.ngAfterViewInit();
        expect(component['loadCanvasWithIncomingImage']).toHaveBeenCalled();
    });

    it('#loadCanvasWithIncomingImage should call #handleNewDrawing with base image if the user creates a new drawing', async () => {
        drawingStub.isNewDrawing = true;
        spyOn(drawingStub, 'handleNewDrawing');
        await component['loadCanvasWithIncomingImage'](baseImage);
        expect(drawingStub.handleNewDrawing).toHaveBeenCalledWith(baseImage);
        expect(drawingStub.isNewDrawing).toBeFalse();
    });

    it("#loadCanvasWithIncomingImage should call #handleNewDrawing with drawing service's new image if image is loaded from carousel ", async () => {
        const newImage = new Image();
        drawingStub.newImage = newImage;
        spyOn(drawingStub, 'handleNewDrawing');
        await component['loadCanvasWithIncomingImage'](baseImage);
        expect(drawingStub.handleNewDrawing).toHaveBeenCalledWith(newImage);
        expect(drawingStub.newImage).toBeUndefined();
    });

    it('#loadCanvasWithIncomingImage should call #changeDrawing from drawingService if the user reloads the editor page', async () => {
        component['refreshedImage'] = imageSpyObj;
        drawingStub.isNewDrawing = false;
        drawingStub.newImage = undefined;

        spyOn(drawingStub, 'changeDrawing');
        await component['loadCanvasWithIncomingImage'](baseImage);
        expect(drawingStub.changeDrawing).toHaveBeenCalled();
    });

    it('#disableDrawing Should disable drawing if the resize button is being used', () => {
        const isUsingResizeButtonStub = true;
        component.disableDrawing(isUsingResizeButtonStub);
        expect(component['canDraw']).toEqual(false);

        component.disableDrawing(!isUsingResizeButtonStub);
        expect(component['canDraw']).toBeTrue();
    });

    it("#onMouseMove should call the current tool's #onMouseMove when receiving a mouse move event if canDraw flag is true", () => {
        component['canDraw'] = true;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseMove');
        component.onMouseMove(mouseEventClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseMove should not call the current tool's #onMouseMove when receiving a mouse move event if canDraw flag is false", () => {
        component['canDraw'] = false;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseMove');
        component.onMouseMove(mouseEventClick);
        expect(mouseEventSpy).not.toHaveBeenCalled();
        expect(mouseEventSpy).not.toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseDown should call the current tool's #onMouseDown when receiving a mouse down event inside the canvas if canDrawflag is true ", () => {
        component['canDraw'] = true;
        spyOn<any>(component, 'isInsideCanvas').and.returnValue(true);
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseDown');
        component.onMouseDown(mouseEventClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseDown should not call the current tool's #onMouseDown when receiving a mouse down event if canDrawflag is false ", () => {
        component['canDraw'] = false;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseDown');
        component.onMouseDown(mouseEventClick);
        expect(mouseEventSpy).not.toHaveBeenCalled();
        expect(mouseEventSpy).not.toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseUp should call the current tool's #onMouseUp when receiving a mouse down event if canDrawflag is true ", () => {
        component['canDraw'] = true;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseUp');
        component.onMouseUp(mouseEventClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventClick);
    });

    it('#onMouseUp is instance of line should not call enableUndoRedo from undoRedoService ', () => {
        component['canDraw'] = true;
        toolsServiceSpy.currentTool = new LineService(drawingStub, colorServiceStub, undoRedoServiceSpyObj);
        component.onMouseUp(mouseEventClick);
        expect(undoRedoServiceSpyObj.enableUndoRedo).not.toHaveBeenCalled();
    });

    it('#onMouseUp is instance of line should not call enableUndoRedo from undoRedoService ', () => {
        component['canDraw'] = true;
        toolsServiceSpy.currentTool = new RectangleSelectionService(
            drawingStub,
            new RectangleDrawingService(drawingStub, colorServiceStub, undoRedoServiceSpyObj),
            undoRedoServiceSpyObj,
            moveSelectionServiceSpyObj,
            resizeSelectionSpyObj,
        );
        component.onMouseUp(mouseEventClick);
        expect(undoRedoServiceSpyObj.enableUndoRedo).not.toHaveBeenCalled();
    });

    it("#onMouseUp should not call the current tool's #onMouseUp when receiving a mouse down event if canDrawflag is true ", () => {
        component['canDraw'] = false;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseUp');
        component.onMouseUp(mouseEventClick);
        expect(mouseEventSpy).not.toHaveBeenCalled();
        expect(mouseEventSpy).not.toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseOut should call the current tool's #onMouseOut when receiving a mouse out event", () => {
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseOut');
        component.onMouseOut(mouseEventClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventClick);
    });

    it('#onKeyDown should call #onKeyDown of hotKeyService', () => {
        component.onKeyDown(keyBoardEvent);
        expect(hotKeyServiceSpy.onKeyDown).toHaveBeenCalled();
    });

    it("#onKeyUp should call tools service's #onKeyUp", () => {
        component.onKeyUp(keyBoardEvent);
        expect(hotKeyServiceSpy.onKeyUp).toHaveBeenCalled();
    });

    it("#onMouseEnter should call the current tool's #onMouseEnter when receiving a mouse enter event if canDrawflag is true", () => {
        component['canDraw'] = true;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseEnter');
        component.onMouseEnter(mouseEventClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseEnter should not call the current tool's #onMouseEnter when receiving a mouse enter event if canDrawflag is false", () => {
        component['canDraw'] = false;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseEnter');
        component.onMouseEnter(mouseEventClick);
        expect(mouseEventSpy).not.toHaveBeenCalled();
        expect(mouseEventSpy).not.toHaveBeenCalledWith(mouseEventClick);
    });

    it('#onMouseDown should call undoRedoService if it is not a selectionTool and is inside the canvas', () => {
        component['canDraw'] = true;
        spyOn<any>(component, 'isInsideCanvas').and.returnValue(true);
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseDown').and.stub();
        component.onMouseDown(mouseEventClick);
        expect(undoRedoServiceSpyObj.disableUndoRedo).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalled();
    });

    it('#onMouseDown should not call undoRedoService if it is a selectionTool', () => {
        component['canDraw'] = true;
        spyOn<any>(component, 'isInsideCanvas').and.returnValue(true);
        toolsServiceSpy.currentTool = new RectangleSelectionService(
            drawingStub,
            new RectangleDrawingService(drawingStub, colorServiceStub, undoRedoServiceSpyObj),
            undoRedoServiceSpyObj,
            moveSelectionServiceSpyObj,
            resizeSelectionSpyObj,
        );
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseDown').and.stub();
        component.onMouseDown(mouseEventClick);
        expect(undoRedoServiceSpyObj.disableUndoRedo).not.toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalled();
    });

    it('#onScroll should call #rotateStamp if the current tool is the stamp', () => {
        const wheelEvent = {} as WheelEvent;
        toolsServiceSpy.stampService = new StampService(drawingStub, undoRedoServiceSpyObj);
        toolsServiceSpy.currentTool = toolsServiceSpy.stampService;
        spyOn(toolsServiceSpy.stampService, 'rotateStamp');
        component.onScroll(wheelEvent);
        expect(toolsServiceSpy.stampService.rotateStamp).toHaveBeenCalledWith(wheelEvent);
    });

    it('#onScroll should not call #rotateStamp if the current tool is not the stamp', () => {
        const wheelEvent = {} as WheelEvent;
        toolsServiceSpy.stampService = new StampService(drawingStub, undoRedoServiceSpyObj);
        spyOn(toolsServiceSpy.stampService, 'rotateStamp');
        component.onScroll(wheelEvent);
        expect(toolsServiceSpy.stampService.rotateStamp).not.toHaveBeenCalledWith(wheelEvent);
    });

    it('#isInsideCanvas should return true if the mouse event click is inside the canvas', () => {
        drawingStub.canvas.width = MOUSE_POSITION_DEFAULT;
        drawingStub.canvas.height = MOUSE_POSITION_DEFAULT;
        component['isInsideCanvas'](mouseEventInsideCanvas);
        expect(component['isInsideCanvas'](mouseEventInsideCanvas)).toBeTrue();
    });

    it('#getRightCursor should return the right cursor if is stamp service', () => {
        toolsServiceSpy.stampService = new StampService(drawingStub, undoRedoServiceSpyObj);
        toolsServiceSpy.currentTool = toolsServiceSpy.stampService;
        expect(component.getRightCursor()).toEqual('none');
    });

    it('#getRightCursor should return the right cursor if is a eraser service', () => {
        toolsServiceSpy.eraserService = new EraserService(drawingStub, colorServiceStub, undoRedoServiceSpyObj);
        toolsServiceSpy.currentTool = toolsServiceSpy.stampService;
        expect(component.getRightCursor()).toEqual('none');
    });

    it('#getRightCursor should return the right cursor if is a lasso service and checkLineCrossing is true', () => {
        toolsServiceSpy.lassoSelectionService = lassoSelectionServiceSpyObj;
        toolsServiceSpy.currentTool = toolsServiceSpy.lassoSelectionService;
        lassoSelectionServiceSpyObj.checkIfLineCrossing.and.returnValue(true);
        expect(component.getRightCursor()).toEqual('not-allowed');
    });

    it('#getRightCursor should return the right cursor if is a lasso service and checkLineCrossing is false', () => {
        toolsServiceSpy.lassoSelectionService = lassoSelectionServiceSpyObj;
        toolsServiceSpy.currentTool = toolsServiceSpy.lassoSelectionService;
        lassoSelectionServiceSpyObj.checkIfLineCrossing.and.returnValue(false);
        spyOn;
        expect(component.getRightCursor()).toEqual('crosshair');
    });

    it('#getRightCursor should return the right cursor if is a line', () => {
        toolsServiceSpy.lineService = lineServiceSpyObj;
        toolsServiceSpy.currentTool = toolsServiceSpy.lineService;

        expect(component.getRightCursor()).toEqual('crosshair');
    });

    it('#getRightCursor should return the right cursor if is rectangleSelectionService', () => {
        toolsServiceSpy.currentTool = toolsServiceSpy.rectangleSelectionService;
        expect(component.getRightCursor()).toEqual('pointer');
    });

    it('#getRightCursor should return the right cursor if is eye dropper service', () => {
        toolsServiceSpy.eyeDropperService = eyeDropperServiceSpyObj;
        toolsServiceSpy.currentTool = toolsServiceSpy.eyeDropperService;
        expect(component.getRightCursor()).toEqual('zoom-in');
    });

    it('#getRightCursor should return the right cursor if is text service and is writing', () => {
        toolsServiceSpy.textService = textServiceSpyObj;
        toolsServiceSpy.currentTool = toolsServiceSpy.textService;
        textServiceSpyObj.isWriting = true;
        expect(component.getRightCursor()).toEqual('pointer');
    });

    it('#getRightCursor should return the right cursor if is text service and is not writing', () => {
        toolsServiceSpy.textService = textServiceSpyObj;
        toolsServiceSpy.currentTool = toolsServiceSpy.textService;
        textServiceSpyObj.isWriting = false;
        expect(component.getRightCursor()).toEqual('text');
    });

    it('#checkIfIsAControlPoint should return ne-resize if is a top_left', () => {
        toolsServiceSpy.currentTool = toolsServiceSpy.rectangleSelectionService;
        toolsServiceSpy.rectangleSelectionService.selectionExists = true;
        spyOn<any>(component, 'returnTrueNwSeDiagonalCursor').and.returnValue('ne-resize');
        component['resizeSelectionService'].previewSelectedPointIndex = SelectedPoint.TOP_LEFT;
        expect(component.checkIfIsAControlPoint()).toEqual('ne-resize');
    });

    it('#checkIfIsAControlPoint should return ne-resize if is a bottom_right', () => {
        toolsServiceSpy.currentTool = toolsServiceSpy.rectangleSelectionService;
        toolsServiceSpy.rectangleSelectionService.selectionExists = true;
        component['resizeSelectionService'].previewSelectedPointIndex = SelectedPoint.BOTTOM_RIGHT;
        spyOn<any>(component, 'returnTrueNwSeDiagonalCursor').and.returnValue('ne-resize');
        expect(component.checkIfIsAControlPoint()).toEqual('ne-resize');
    });

    it('#checkIfIsAControlPoint should return ne-resize if is a BOTTOM_LEFT', () => {
        toolsServiceSpy.currentTool = toolsServiceSpy.rectangleSelectionService;
        toolsServiceSpy.rectangleSelectionService.selectionExists = true;
        component['resizeSelectionService'].previewSelectedPointIndex = SelectedPoint.BOTTOM_LEFT;
        spyOn<any>(component, 'returnTrueNeSwDiagonalCursor').and.returnValue('ne-resize');
        expect(component.checkIfIsAControlPoint()).toEqual('ne-resize');
    });

    it('#checkIfIsAControlPoint should return ne-resize if is a TOP_RIGHT', () => {
        toolsServiceSpy.currentTool = toolsServiceSpy.rectangleSelectionService;
        toolsServiceSpy.rectangleSelectionService.selectionExists = true;
        component['resizeSelectionService'].previewSelectedPointIndex = SelectedPoint.TOP_RIGHT;
        spyOn<any>(component, 'returnTrueNeSwDiagonalCursor').and.returnValue('ne-resize');
        expect(component.checkIfIsAControlPoint()).toEqual('ne-resize');
    });

    it('#checkIfIsAControlPoint should return n-resize if is a BOTTOM_MIDDLE', () => {
        toolsServiceSpy.currentTool = toolsServiceSpy.rectangleSelectionService;
        toolsServiceSpy.rectangleSelectionService.selectionExists = true;
        component['resizeSelectionService'].previewSelectedPointIndex = SelectedPoint.BOTTOM_MIDDLE;
        expect(component.checkIfIsAControlPoint()).toEqual('n-resize');
    });

    it('#checkIfIsAControlPoint should return n-resize if is a TOP_MIDDLE', () => {
        toolsServiceSpy.currentTool = toolsServiceSpy.rectangleSelectionService;
        toolsServiceSpy.rectangleSelectionService.selectionExists = true;
        component['resizeSelectionService'].previewSelectedPointIndex = SelectedPoint.TOP_MIDDLE;
        expect(component.checkIfIsAControlPoint()).toEqual('n-resize');
    });

    it('#checkIfIsAControlPoint should return n-resize if is a LEFT_MIDDLE', () => {
        toolsServiceSpy.currentTool = toolsServiceSpy.rectangleSelectionService;
        toolsServiceSpy.rectangleSelectionService.selectionExists = true;
        component['resizeSelectionService'].previewSelectedPointIndex = SelectedPoint.MIDDLE_LEFT;
        expect(component.checkIfIsAControlPoint()).toEqual('w-resize');
    });

    it('#checkIfIsAControlPoint should return n-resize if is a RIGHT_MIDDLE', () => {
        toolsServiceSpy.currentTool = toolsServiceSpy.rectangleSelectionService;
        toolsServiceSpy.rectangleSelectionService.selectionExists = true;
        component['resizeSelectionService'].previewSelectedPointIndex = SelectedPoint.MIDDLE_RIGHT;
        expect(component.checkIfIsAControlPoint()).toEqual('w-resize');
    });

    it('#checkIfIsAControlPoint should return n-resize if is a center', () => {
        toolsServiceSpy.currentTool = toolsServiceSpy.rectangleSelectionService;
        toolsServiceSpy.rectangleSelectionService.selectionExists = true;
        component['resizeSelectionService'].previewSelectedPointIndex = SelectedPoint.CENTER;
        expect(component.checkIfIsAControlPoint()).toEqual('move');
    });

    it('#checkIfIsAControlPoint should return pointer if is not of any other options above', () => {
        toolsServiceSpy.currentTool = toolsServiceSpy.rectangleSelectionService;
        toolsServiceSpy.rectangleSelectionService.selectionExists = true;
        component['resizeSelectionService'].previewSelectedPointIndex = -2;
        expect(component.checkIfIsAControlPoint()).toEqual('pointer');
    });

    it('#returnTrueNwSeDiagonalCursor nw-resize if x is not flipped and y is not flipped', () => {
        spyOn<any>(component, 'xSelectionIsFlipped').and.returnValue(false);
        spyOn<any>(component, 'ySelectionIsFlipped').and.returnValue(false);
        expect(component['returnTrueNwSeDiagonalCursor']()).toEqual('nw-resize');
    });

    it('#returnTrueNwSeDiagonalCursor ne-resize if x is not flipped and y is flipped', () => {
        spyOn<any>(component, 'xSelectionIsFlipped').and.returnValue(false);
        spyOn<any>(component, 'ySelectionIsFlipped').and.returnValue(true);
        expect(component['returnTrueNwSeDiagonalCursor']()).toEqual('ne-resize');
    });

    it('#returnTrueNwSeDiagonalCursor nw-resize if x is  flipped and y is  flipped', () => {
        spyOn<any>(component, 'xSelectionIsFlipped').and.returnValue(true);
        spyOn<any>(component, 'ySelectionIsFlipped').and.returnValue(true);
        expect(component['returnTrueNwSeDiagonalCursor']()).toEqual('nw-resize');
    });

    it('#returnTrueNwSeDiagonalCursor ne-resize if x is flipped and y is not flipped', () => {
        spyOn<any>(component, 'xSelectionIsFlipped').and.returnValue(true);
        spyOn<any>(component, 'ySelectionIsFlipped').and.returnValue(false);
        expect(component['returnTrueNwSeDiagonalCursor']()).toEqual('ne-resize');
    });

    it('#returnTrueNeSwDiagonalCursor ne-resize if x is not flipped and y is not flipped', () => {
        spyOn<any>(component, 'xSelectionIsFlipped').and.returnValue(false);
        spyOn<any>(component, 'ySelectionIsFlipped').and.returnValue(false);
        expect(component['returnTrueNeSwDiagonalCursor']()).toEqual('ne-resize');
    });

    it('#returnTrueNeSwDiagonalCursor nw-resize if x is not flipped and y is flipped', () => {
        spyOn<any>(component, 'xSelectionIsFlipped').and.returnValue(false);
        spyOn<any>(component, 'ySelectionIsFlipped').and.returnValue(true);
        expect(component['returnTrueNeSwDiagonalCursor']()).toEqual('nw-resize');
    });

    it('#returnTrueNeSwDiagonalCursor ne-resize if x is flipped and y is flipped', () => {
        spyOn<any>(component, 'xSelectionIsFlipped').and.returnValue(true);
        spyOn<any>(component, 'ySelectionIsFlipped').and.returnValue(true);
        expect(component['returnTrueNeSwDiagonalCursor']()).toEqual('ne-resize');
    });

    it('#returnTrueNeSwDiagonalCursor nw-resize if x is flipped and y is not flipped', () => {
        spyOn<any>(component, 'xSelectionIsFlipped').and.returnValue(true);
        spyOn<any>(component, 'ySelectionIsFlipped').and.returnValue(false);
        expect(component['returnTrueNeSwDiagonalCursor']()).toEqual('nw-resize');
    });

    it('#ySelectionIsFlipped should return false if y are not flipped', () => {
        toolsServiceSpy.currentTool = toolsServiceSpy.rectangleSelectionService;
        toolsServiceSpy.rectangleSelectionService.coords = coordsStub;
        expect(component['ySelectionIsFlipped']()).toBeFalse();
    });

    it('#xSelectionIsFlipped should return false if x are not flipped', () => {
        toolsServiceSpy.currentTool = toolsServiceSpy.rectangleSelectionService;
        toolsServiceSpy.rectangleSelectionService.coords = coordsStub;
        expect(component['xSelectionIsFlipped']()).toBeFalse();
    });

    it('#xSelectionIsFlipped should return true if x are flipped', () => {
        toolsServiceSpy.currentTool = toolsServiceSpy.rectangleSelectionService;
        toolsServiceSpy.rectangleSelectionService.coords = xFlippedCoordsStub;
        expect(component['xSelectionIsFlipped']()).toBeTrue();
    });

    it('#ySelectionIsFlipped should return true if y are flipped', () => {
        toolsServiceSpy.currentTool = toolsServiceSpy.rectangleSelectionService;
        toolsServiceSpy.rectangleSelectionService.coords = yFlippedCoordsStub;
        expect(component['ySelectionIsFlipped']()).toBeTrue();
    });
});
