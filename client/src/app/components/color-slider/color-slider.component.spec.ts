import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorSliderComponent } from './color-slider.component';

describe('ColorSliderComponent', () => {
    let component: ColorSliderComponent;
    let fixture: ComponentFixture<ColorSliderComponent>;
    const DEFAULT_X = 26;
    const DEFAULT_Y = 44;
    const mouseEvent: MouseEvent = new MouseEvent('mouse test');

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorSliderComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create a new CanvasRenderingContext2D instance if ctx is undefined', () => {
        component.draw();
        // tslint:disable-next-line: no-string-literal
        expect(component['ctx']).not.toBeUndefined();
    });

    it('should display a rectangle icon above the mouse if a position is selected on the slider ', () => {
        component.selectedHeight = DEFAULT_X;
        const EXPECTED_LINE_WIDTH = 5;
        component.draw();
        // tslint:disable-next-line: no-string-literal
        expect(component['ctx'].lineWidth).toEqual(EXPECTED_LINE_WIDTH); // idicator that we entered the if condition to draw the rectangle
    });

    it('should not display a rectangle icon above the mouse no position is selected on the slider ', () => {
        const EXPECTED_LINE_WIDTH = 5;
        component.draw();
        // tslint:disable-next-line: no-string-literal
        expect(component['ctx'].lineWidth).not.toEqual(EXPECTED_LINE_WIDTH); // idicator that we entered the if condition to draw the rectangle
    });

    it('#onMouseUp should set mousedown to false', () => {
        // tslint:disable-next-line: no-string-literal
        component['mousedown'] = true;
        component.onMouseUp();
        // tslint:disable-next-line: no-string-literal
        expect(component['mousedown']).toBe(false);
    });

    it('#onMouseDown should call #handleMouseEvent', () => {
        spyOn(component, 'handleMouseEvent');
        component.onMouseDown(mouseEvent);
        expect(component.handleMouseEvent).toHaveBeenCalled();
        expect(component.handleMouseEvent).toHaveBeenCalledWith(mouseEvent);
    });

    it('#onMouseMove should call #handleMouseEvent if the mouse is already down', () => {
        // tslint:disable-next-line: no-string-literal
        component['mousedown'] = true;
        spyOn(component, 'handleMouseEvent');
        component.onMouseMove(mouseEvent);
        expect(component.handleMouseEvent).toHaveBeenCalled();
        expect(component.handleMouseEvent).toHaveBeenCalledWith(mouseEvent);
    });

    it('#onMouseMove should not call #handleMouseEvent if the mouse is not already down', () => {
        // tslint:disable-next-line: no-string-literal
        component['mousedown'] = false;
        spyOn(component, 'handleMouseEvent');
        component.onMouseMove(mouseEvent);
        expect(component.handleMouseEvent).not.toHaveBeenCalled();
    });

    it('#handleMouseEvent should call #draw and emit a color', () => {
        spyOn(component, 'draw');
        spyOn(component, 'emitColor');
        component.handleMouseEvent(mouseEvent);
        expect(component.draw).toHaveBeenCalled();
        expect(component.emitColor).toHaveBeenCalledWith(mouseEvent.offsetX, mouseEvent.offsetY);
    });

    it('should emit color correctly', () => {
        spyOn(component.color, 'emit');
        component.emitColor(DEFAULT_X, DEFAULT_Y);
        expect(component.color.emit).toHaveBeenCalled();
        expect(component.color.emit).toHaveBeenCalledWith(component.getColorAtPosition(DEFAULT_X, DEFAULT_Y));
    });

    it('should get the right color at given position', () => {
        // tslint:disable-next-line: no-string-literal
        const expectedColor = 'rgb(243,255,0)';
        expect(component.getColorAtPosition(DEFAULT_X, DEFAULT_Y)).toBe(expectedColor);
    });
});
