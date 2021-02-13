import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorPaletteComponent } from './color-palette.component';
// tslint:disable:no-string-literal
describe('ColorPaletteComponent', () => {
    let component: ColorPaletteComponent;
    let fixture: ComponentFixture<ColorPaletteComponent>;
    const DEFAULT_X = 127;
    const DEFAULT_Y = 130;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorPaletteComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPaletteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#renderPalette should create a new CanvasRenderingContext2D instance if ctx is undefined', () => {
        component.renderPalette();
        expect(component['ctx']).not.toBeUndefined();
    });

    it('#renderCircle should render a circle icon above the mouse if a position is selected on the palette ', () => {
        component.selectedPosition = { x: DEFAULT_X, y: DEFAULT_Y };
        component.renderPalette();
        expect(component['ctx'].lineWidth).toEqual(component.THICKNESS); // idicator that we entered the if condition to draw the circle
    });

    it('#renderCircle should not render a circle icon above the mouse if no position is selected on the palette ', () => {
        component.renderPalette();
        expect(component['ctx'].lineWidth).not.toEqual(component.THICKNESS);
    });

    it('#ngOnChanges should emit a color if a position is selected', () => {
        component.selectedPosition = { x: 10, y: 10 };
        spyOn(component.color, 'emit');
        component.ngOnChanges();
        expect(component.color.emit).toHaveBeenCalled();
    });

    it('#ngOnChanges should not emit a color if no position is selected', () => {
        spyOn(component.color, 'emit');
        component.ngOnChanges();
        expect(component.color.emit).not.toHaveBeenCalled();
    });

    it('#onMouseUp should set mousedown to false', () => {
        component['mousedown'] = true;
        component.onMouseUp();
        expect(component['mousedown']).toBeFalse();
    });

    it('#onMouseDown should emit color', () => {
        spyOn(component.color, 'emit');
        const mouseEvent: MouseEvent = {
            offsetX: DEFAULT_X,
            offsetY: DEFAULT_Y,
        } as MouseEvent;

        component.onMouseDown(mouseEvent);
        expect(component.color.emit).toHaveBeenCalled();
        expect(component.color.emit).toHaveBeenCalledWith(component.getColorAtPosition(DEFAULT_X, DEFAULT_Y));
        expect(component['mousedown']).toBeTrue();
    });

    it('#onMouseMove should display the updated mouse circle if mouse is down ', () => {
        component['mousedown'] = true;
        const event = new MouseEvent('test event');
        spyOn(component, 'handleMouseEvent');
        component.onMouseMove(event);
        expect(component.handleMouseEvent).toHaveBeenCalled();
        expect(component.handleMouseEvent).toHaveBeenCalledWith(event);
    });

    it('#onMouseMove should not display the updated mouse circle if mouse is not down ', () => {
        component['mousedown'] = false;
        const event = new MouseEvent('test event');
        spyOn(component, 'handleMouseEvent');
        component.onMouseMove(event);
        expect(component.handleMouseEvent).not.toHaveBeenCalled();
        expect(component.handleMouseEvent).not.toHaveBeenCalledWith(event);
    });

    it('#handleMouseEvent should handle a mouse event correctly', () => {
        const mouseEvent: MouseEvent = {
            offsetX: DEFAULT_X,
            offsetY: DEFAULT_Y,
        } as MouseEvent;
        spyOn(component, 'renderPalette');
        spyOn(component, 'emitColor');
        component.handleMouseEvent(mouseEvent);
        expect(component.selectedPosition.x).toBe(mouseEvent.offsetX);
        expect(component.selectedPosition.y).toBe(mouseEvent.offsetY);
        expect(component.renderPalette).toHaveBeenCalled();
        expect(component.emitColor).toHaveBeenCalledWith(mouseEvent.offsetX, mouseEvent.offsetY);
    });

    it('#emitColor should emit color correctly', () => {
        spyOn(component.color, 'emit');
        component.emitColor(DEFAULT_X, DEFAULT_Y);
        expect(component.color.emit).toHaveBeenCalled();
        expect(component.color.emit).toHaveBeenCalledWith(component.getColorAtPosition(DEFAULT_X, DEFAULT_Y));
    });

    it('should get the right color at given position', () => {
        component.hue = 'rgb(255,0,0)';
        const expectedColor = 'rgb(122,122,122)';
        expect(component.getColorAtPosition(DEFAULT_X, DEFAULT_Y)).toBe(expectedColor);
    });
});
