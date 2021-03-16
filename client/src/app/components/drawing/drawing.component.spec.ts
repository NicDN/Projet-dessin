import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { BoxSize } from '@app/classes/box-size';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { PencilService } from '@app/services/tools/drawing-tool/pencil/pencil.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, DrawingComponent, HALF_RATIO, SIDE_BAR_SIZE } from './drawing.component';

const MOUSE_POSITION_DEFAULT = 1000;
const mouseEventClick = { pageX: MOUSE_POSITION_DEFAULT, pageY: MOUSE_POSITION_DEFAULT, button: 0 } as MouseEvent;
const keyBoardEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: true });
const OVER_MINIMUM_WIDTH = 1000;
const OVER_MINIMUM_HEIGHT = 1000;
const UNDER_MINIMUM_WIDTH = 600;
const UNDER_MINIMUM_HEIGHT = 400;

// tslint:disable: no-string-literal
describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;

    // tslint:disable-next-line: prefer-const
    let colorServiceStub: ColorService;
    let drawingStub: DrawingService;
    // let boxSizeStub: BoxSize;
    let onLoadCanvasWidth: number;
    let onLoadCanvasHeight: number;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;

    let hotKeyServiceSpy: jasmine.SpyObj<HotkeyService>;
    let toolsServiceSpy: jasmine.SpyObj<ToolsService>;

    beforeEach(async(() => {
        drawingStub = new DrawingService();

        toolsServiceSpy = jasmine.createSpyObj('ToolsService', ['onKeyUp']);
        hotKeyServiceSpy = jasmine.createSpyObj('HotkeyService', ['onKeyDown']);
        undoRedoServiceSpyObj = jasmine.createSpyObj('HotkeyService', ['addCommand']);

        TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            providers: [
                { provide: ToolsService, useValue: toolsServiceSpy },
                { provide: DrawingService, useValue: drawingStub },
                { provide: HotkeyService, useValue: hotKeyServiceSpy },
                { provide: ColorService, useValue: colorServiceStub },
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

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#ngAfterViewInit should set the base context and preview context correctly', () => {
        component.ngAfterViewInit();
        expect(component['drawingService'].baseCtx).toBe(component.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D);
        expect(component['drawingService'].previewCtx).toBe(component.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D);
        expect(component.drawingService.canvas).toBe(component.baseCanvas.nativeElement);
        expect(component.drawingService.previewCanvas).toBe(component.previewCanvas.nativeElement);
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

    it("#onMouseDown should call the current tool's #onMouseDown when receiving a mouse down event if canDrawflag is true ", () => {
        component['canDraw'] = true;
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

    it("#onMouseUp should not call the current tool's #onMouseUp when receiving a mouse down event if canDrawflag is true ", () => {
        component['canDraw'] = false;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentTool, 'onMouseUp');
        component.onMouseUp(mouseEventClick);
        expect(mouseEventSpy).not.toHaveBeenCalled();
        expect(mouseEventSpy).not.toHaveBeenCalledWith(mouseEventClick);
    });

    it('#onKeyDown should call #onKeyDown of hotKeyService', () => {
        component.onKeyDown(keyBoardEvent);
        expect(hotKeyServiceSpy.onKeyDown).toHaveBeenCalled();
    });

    it("#onKeyUp should call tools service's #onKeyUp", () => {
        component.onKeyUp(keyBoardEvent);
        expect(toolsServiceSpy.onKeyUp).toHaveBeenCalled();
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

    it('#setDimensions should return default canvas width if workspace size is under the minimum workspace size allowed', () => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: UNDER_MINIMUM_WIDTH });
        component.setCanvasDimensions();
        expect(component['canvasWidth']).toEqual(DEFAULT_WIDTH);
    });

    it('#setDimensions should return default canvas height if workspace size is under the minimum workspace size allowed', () => {
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: UNDER_MINIMUM_HEIGHT });
        component.setCanvasDimensions();
        expect(component['canvasHeight']).toEqual(DEFAULT_HEIGHT);
    });

    it('#setDimensions should return the loaded canvas width if workspace size is above the minimum workspace size allowed', () => {
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: OVER_MINIMUM_WIDTH });
        onLoadCanvasWidth = (window.innerWidth - SIDE_BAR_SIZE) * HALF_RATIO;
        component.setCanvasDimensions();
        expect(component['canvasWidth']).toEqual(onLoadCanvasWidth);
    });

    it('#setDimensions should return the loaded canvas height if workspace size is above the minimum workspace size allowed', () => {
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: OVER_MINIMUM_HEIGHT });
        onLoadCanvasHeight = window.innerHeight * HALF_RATIO;
        component.setCanvasDimensions();
        expect(component['canvasHeight']).toEqual(onLoadCanvasHeight);
    });
});
