import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorPaletteComponent } from './color-palette.component';

describe('ColorPaletteComponent', () => {
    let component: ColorPaletteComponent;
    let fixture: ComponentFixture<ColorPaletteComponent>;
    const DEFAULT_X = 127;
    const DEFAULT_Y = 130;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorPaletteComponent],
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

    it('should create a new CanvasRenderingContext2D instance if ctx is undefined', () => {
        component.draw();
        // tslint:disable-next-line: no-string-literal
        expect(component['ctx']).not.toBeUndefined();
    });

    it('should display a circle icon above the mouse if a position is selected on the palette ', () => {
        component.selectedPosition = { x: DEFAULT_X, y: DEFAULT_Y };
        component.draw();
        // tslint:disable-next-line: no-string-literal
        expect(component['ctx'].lineWidth).toEqual(component.THICKNESS); // idicator that we entered the if condition to draw the circle
    });

    it('should not display a circle icon above the mouse if no position is selected on the palette ', () => {
        component.draw();
        // tslint:disable-next-line: no-string-literal
        expect(component['ctx'].lineWidth).not.toEqual(component.THICKNESS);
    });

    it('should emit a color on #ngOnChanges if a position is selected', () => {
        component.selectedPosition = { x: 10, y: 10 };
        spyOn(component.color, 'emit');
        component.ngOnChanges();
        expect(component.color.emit).toHaveBeenCalled();
    });

    it('should not emit a color on #ngOnChanges if no position is selected', () => {
        spyOn(component.color, 'emit');
        component.ngOnChanges();
        expect(component.color.emit).not.toHaveBeenCalled();
    });

    it('#onMouseUp should set mousedown to false', () => {
        // tslint:disable-next-line: no-string-literal
        component['mousedown'] = true;
        component.onMouseUp();
        // tslint:disable-next-line: no-string-literal
        expect(component['mousedown']).toBe(false);
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
    });

    it('#onMouseMove should display the updated mouse circle if mouse is down ', () => {
        // tslint:disable-next-line: no-string-literal
        component['mousedown'] = true;
        const event = new MouseEvent('test event');
        spyOn(component, 'draw');
        spyOn(component, 'emitColor');
        component.onMouseMove(event);
        expect(component.draw).toHaveBeenCalled();
        expect(component.emitColor).toHaveBeenCalled();
    });

    it('#onMouseMove should not display the updated mouse circle if mouse is not down ', () => {
        // tslint:disable-next-line: no-string-literal
        component['mousedown'] = false;
        const event = new MouseEvent('test event');
        spyOn(component, 'draw');
        spyOn(component, 'emitColor');
        component.onMouseMove(event);
        expect(component.draw).not.toHaveBeenCalled();
        expect(component.emitColor).not.toHaveBeenCalled();
    });

    it('should emit color correctly', () => {
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
