import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BoxSize } from '@app/classes/box-size';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { EyeDropperService } from '@app/services/tools/eye-dropper/eye-dropper.service';
import { LineService } from '@app/services/tools/line/line.service';
import { PencilService } from '@app/services/tools/pencil/pencil-service';
import { EllipseDrawingService } from '@app/services/tools/shape/ellipse/ellipse-drawing.service';
import { PolygonService } from '@app/services/tools/shape/polygon/polygon.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { SprayCanService } from '@app/services/tools/spray-can/spray-can.service';
import { ToolsService } from '@app/services/tools/tools.service';
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
    let router: Router;
    let hotkeyStub: HotkeyService;
    let drawingStub: DrawingService;
    let toolsServiceStub: ToolsService;
    let colorServiceStub: ColorService;
    let boxSizeStub: BoxSize;
    let onLoadCanvasWidth: number;
    let onLoadCanvasHeight: number;

    beforeEach(async(() => {
        boxSizeStub = { widthBox: 1, heightBox: 1 };
        drawingStub = new DrawingService();
        toolsServiceStub = new ToolsService(
            {} as PencilService,
            {} as EllipseDrawingService,
            {} as RectangleDrawingService, 
            {} as PolygonService,
            {} as LineService,
            {} as EraserService,
            {} as SprayCanService,
            {} as EyeDropperService,
        );
        hotkeyStub = new HotkeyService(router, drawingStub, toolsServiceStub);
        TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            providers: [
                { provide: ToolsService, useValue: toolsServiceStub },
                { provide: DrawingService, useValue: drawingStub },
                { provide: HotkeyService, useValue: hotkeyStub },
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
        toolsServiceStub = TestBed.inject(ToolsService);
        colorServiceStub = TestBed.inject(ColorService);
        hotkeyStub = TestBed.inject(HotkeyService);
        drawingStub = TestBed.inject(DrawingService);
        toolsServiceStub.currentTool = new PencilService(drawingStub, colorServiceStub);

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#ngAfterViewInit should set the base context and preview context correctly', () => {
        component.ngAfterViewInit();
        expect(component['baseCtx']).toBe(component.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D);
        expect(component['previewCtx']).toBe(component.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D);
        expect(component.drawingService.baseCtx).toBe(component['baseCtx']);
        expect(component.drawingService.previewCtx).toBe(component['previewCtx']);
        expect(component.drawingService.canvas).toBe(component.baseCanvas.nativeElement);
        expect(component.drawingService.previewCanvas).toBe(component.previewCanvas.nativeElement);
    });

    it('#disableDrawing Should disable drawing if the resize button is being used', () => {
        const isUsingResizeButtonStub = true;
        component.disableDrawing(isUsingResizeButtonStub);
        expect(component.canDraw).toEqual(false);

        component.disableDrawing(!isUsingResizeButtonStub);
        expect(component.canDraw).toBeTrue();
    });

    it('#onSizeChange should call the drawingService #onSizeChange', () => {
        const onSizeChangeSpy = spyOn(drawingStub, 'onSizeChange');
        component.onSizeChange(boxSizeStub);
        expect(onSizeChangeSpy).toHaveBeenCalled();
    });

    it("#onMouseMove should call the current tool's #onMouseMove when receiving a mouse move event if canDraw flag is true", () => {
        component.canDraw = true;
        const mouseEventSpy = spyOn(toolsServiceStub.currentTool, 'onMouseMove');
        component.onMouseMove(mouseEventClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseMove should not call the current tool's #onMouseMove when receiving a mouse move event if canDraw flag is false", () => {
        component.canDraw = false;
        const mouseEventSpy = spyOn(toolsServiceStub.currentTool, 'onMouseMove');
        component.onMouseMove(mouseEventClick);
        expect(mouseEventSpy).not.toHaveBeenCalled();
        expect(mouseEventSpy).not.toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseDown should call the current tool's #onMouseDown when receiving a mouse down event if canDrawflag is true ", () => {
        component.canDraw = true;
        const mouseEventSpy = spyOn(toolsServiceStub.currentTool, 'onMouseDown');
        component.onMouseDown(mouseEventClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseDown should not call the current tool's #onMouseDown when receiving a mouse down event if canDrawflag is false ", () => {
        component.canDraw = false;
        const mouseEventSpy = spyOn(toolsServiceStub.currentTool, 'onMouseDown');
        component.onMouseDown(mouseEventClick);
        expect(mouseEventSpy).not.toHaveBeenCalled();
        expect(mouseEventSpy).not.toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseUp should call the current tool's #onMouseUp when receiving a mouse down event if canDrawflag is true ", () => {
        component.canDraw = true;
        const mouseEventSpy = spyOn(toolsServiceStub.currentTool, 'onMouseUp');
        component.onMouseUp(mouseEventClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseUp should not call the current tool's #onMouseUp when receiving a mouse down event if canDrawflag is true ", () => {
        component.canDraw = false;
        const mouseEventSpy = spyOn(toolsServiceStub.currentTool, 'onMouseUp');
        component.onMouseUp(mouseEventClick);
        expect(mouseEventSpy).not.toHaveBeenCalled();
        expect(mouseEventSpy).not.toHaveBeenCalledWith(mouseEventClick);
    });

    it('#onKeyDown should call tools service #onKeyDown of hotKeyService', () => {
        const hotKeyServiceOnHotKeyDown = spyOn(hotkeyStub, 'onKeyDown');
        component.onKeyDown(keyBoardEvent);
        expect(hotKeyServiceOnHotKeyDown).toHaveBeenCalled();
    });

    it('#onKeyUp should call tools service #onKeyDown of hotKeyService', () => {
        const hotKeyServiceOnHotKeyUp = spyOn(toolsServiceStub.currentTool, 'onKeyUp');
        component.onKeyUp(keyBoardEvent);
        expect(hotKeyServiceOnHotKeyUp).toHaveBeenCalled();
    });

    it("#onMouseOut should call the current tool's #onMouseOut when receiving a mouse out event if canDrawflag is true ", () => {
        component.canDraw = true;
        const mouseEventSpy = spyOn(toolsServiceStub.currentTool, 'onMouseOut');
        component.onMouseOut(mouseEventClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseOut should not call the current tool's #onMouseOut when receiving a mouse out event if canDrawflag is false ", () => {
        component.canDraw = false;
        const mouseEventSpy = spyOn(toolsServiceStub.currentTool, 'onMouseOut');
        component.onMouseOut(mouseEventClick);
        expect(mouseEventSpy).not.toHaveBeenCalled();
        expect(mouseEventSpy).not.toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseEnter should call the current tool's #onMouseEnter when receiving a mouse enter event if canDrawflag is true", () => {
        component.canDraw = true;
        const mouseEventSpy = spyOn(toolsServiceStub.currentTool, 'onMouseEnter');
        component.onMouseEnter(mouseEventClick);
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(mouseEventClick);
    });

    it("#onMouseEnter should not call the current tool's #onMouseEnter when receiving a mouse enter event if canDrawflag is false", () => {
        component.canDraw = false;
        const mouseEventSpy = spyOn(toolsServiceStub.currentTool, 'onMouseEnter');
        component.onMouseEnter(mouseEventClick);
        expect(mouseEventSpy).not.toHaveBeenCalled();
        expect(mouseEventSpy).not.toHaveBeenCalledWith(mouseEventClick);
    });

    it('#getWidth should return default canvas width if workspace size is under the minimum workspace size allowed', () => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: UNDER_MINIMUM_WIDTH });
        expect(component.width).toEqual(DEFAULT_WIDTH);
    });

    it('#getHeight should return default canvas height if workspace size is under the minimum workspace size allowed', () => {
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: UNDER_MINIMUM_HEIGHT });
        expect(component.height).toEqual(DEFAULT_HEIGHT);
    });

    it('#getWidth should return the loaded canvas width if workspace size is above the minimum workspace size allowed', () => {
        onLoadCanvasWidth = (window.innerWidth - SIDE_BAR_SIZE) * HALF_RATIO;
        expect(component.width).toEqual(onLoadCanvasWidth);
    });

    it('#getHeight should return the loaded canvas height if workspace size is above the minimum workspace size allowed', () => {
        onLoadCanvasHeight = window.innerHeight * HALF_RATIO;
        expect(component.height).toEqual(onLoadCanvasHeight);
    });
});
