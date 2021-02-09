import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { Color } from '@app/classes/color';
import { ColorService } from '@app/services/color/color.service';

import { ColorPanelComponent } from './color-panel.component';

fdescribe('ColorPanelComponent', () => {
    let component: ColorPanelComponent;
    let fixture: ComponentFixture<ColorPanelComponent>;
    const DEFAULT_COLOR = new Color('rgb(1,2,3)', 1);
    let colorService: ColorService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorPanelComponent],
            providers: [ColorService],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        colorService = TestBed.inject(ColorService);
        // colorService = fixture.debugElement.injector.get(ColorService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should select a color correctly', () => {
        component.selectColor(DEFAULT_COLOR);
        expect(component.selectedColor).toBe(DEFAULT_COLOR);
        expect(component.color).toBe(DEFAULT_COLOR.rgbValue);
        expect(component.opacity).toBe(DEFAULT_COLOR.opacity);
        expect(component.hue).toBe(DEFAULT_COLOR.rgbValue);
        expect(component.openColorPicker).toBe(true);
    });

    it('should switch colors correctly', () => {
        spyOn(colorService, 'switchColors');
        component.switchColors();
        expect(colorService.switchColors).toHaveBeenCalled();
        expect(component.openColorPicker).toBe(false);
    });

    it('should set the primary color correctly', () => {
        const DEFAULT_INDEX = 3;
        spyOn(colorService, 'updateMainColor');
        component.setPrimaryColor(DEFAULT_INDEX);
        expect(colorService.updateMainColor).toHaveBeenCalled();
        expect(component.openColorPicker).toBe(false);
        // can i assume that the boolean openColorPicker is by default false
    });

    it('should set the secondary color correctly', () => {
        const DEFAULT_INDEX = 3;
        spyOn(colorService, 'updateSecondaryColor');
        component.setSecondaryColor(DEFAULT_INDEX);
        expect(colorService.updateSecondaryColor).toHaveBeenCalled();
        expect(component.openColorPicker).toBe(false);
        // can i assume that the boolean openColorPicker is by default false
    });

    it('should update opacity correctly', () => {
        const matSliderChange = new MatSliderChange();
        const MAT_SLIDER_CHANGE_DEFAULT_VALUE = 50;
        const OPACITY_EXPECTED_VALUE = 0.5;
        matSliderChange.value = MAT_SLIDER_CHANGE_DEFAULT_VALUE;
        component.updateOpacity(matSliderChange);
        expect(component.opacity).toBe(OPACITY_EXPECTED_VALUE);
    });

    it('should get the opacity correctly', () => {
        const DEFAULT_OPACITY = 0.5;
        component.opacity = DEFAULT_OPACITY;
        const OPACITY_EXPECTED_VALUE = 50;
        expect(component.getOpacity()).toBe(OPACITY_EXPECTED_VALUE);
    });

    it('should get a rgb value correctly', () => {
        // for the red value
        let RGB_INDEX = 0;
        component.color = DEFAULT_COLOR.rgbValue;
        expect(component.getRGB(RGB_INDEX)).toBe('1');
        // for the green value
        RGB_INDEX = 1;
        component.color = DEFAULT_COLOR.rgbValue;
        expect(component.getRGB(RGB_INDEX)).toBe('2');
        // for the blue value
        RGB_INDEX = 2;
        component.color = DEFAULT_COLOR.rgbValue;
        expect(component.getRGB(RGB_INDEX)).toBe('3');
    });

    it('should apply the rgb input correctly when a normal hex value is provided', () => {
        // Testing with a normal hex value (A)
        const NORMAL_HEX = 'A';
        component.color = DEFAULT_COLOR.rgbValue;
        component.rgbArray = ['1', '2', '3'];
        component.applyRGBInput(NORMAL_HEX, 1);
        expect(component.rgbArray).toEqual(['1', '10', '3']);
        expect(component.color).toBe('rgb(1,10,3)');
    });

    it('should apply the rgb input correctly when a minimum hex value is provided', () => {
        // Testing with a minmumum hex value (0)
        const MIMIMUM_HEX = '0';
        component.color = DEFAULT_COLOR.rgbValue;
        component.rgbArray = ['1', '2', '3'];
        component.applyRGBInput(MIMIMUM_HEX, 1);
        expect(component.rgbArray).toEqual(['1', '0', '3']);
        expect(component.color).toBe('rgb(1,0,3)');
    });

    it('should apply the rgb input correctly when a maximum hex value is provided', () => {
        // Testing with a maximum hex value (FF)
        const MAXIMUM_HEX = 'ff';
        component.color = DEFAULT_COLOR.rgbValue;
        component.rgbArray = ['1', '2', '3'];
        component.applyRGBInput(MAXIMUM_HEX, 1);
        expect(component.rgbArray).toEqual(['1', '255', '3']);
        expect(component.color).toBe('rgb(1,255,3)');
    });

    it('should not apply the rgb input when a hex value above FF provided', () => {
        const INCORRECT_HEX = 'AF4';
        component.color = DEFAULT_COLOR.rgbValue;
        component.rgbArray = ['1', '2', '3'];
        component.applyRGBInput(INCORRECT_HEX, 1);
        expect(component.rgbArray).toEqual(['1', '2', '3']);
        expect(component.color).toBe('rgb(1,2,3)');
    });

    it('should not apply the rgb input when a hex value is negative', () => {
        const INCORRECT_HEX = '-B';
        component.color = DEFAULT_COLOR.rgbValue;
        component.rgbArray = ['1', '2', '3'];
        component.applyRGBInput(INCORRECT_HEX, 1);
        expect(component.rgbArray).toEqual(['1', '2', '3']);
        expect(component.color).toBe('rgb(1,2,3)');
    });

    it('should not apply the rgb input when the value provided is not a hex value', () => {});

    // empty string = 0;
});
