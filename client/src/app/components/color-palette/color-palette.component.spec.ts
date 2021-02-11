import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorPaletteComponent } from './color-palette.component';

fdescribe('ColorPaletteComponent', () => {
    let component: ColorPaletteComponent;
    let fixture: ComponentFixture<ColorPaletteComponent>;

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
        component.selectedPosition = { x: 10, y: 10 };
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


});
