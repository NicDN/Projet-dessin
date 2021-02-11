import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { By } from '@angular/platform-browser';
import { Color } from '@app/classes/color';
import { ColorService } from '@app/services/color/color.service';

import { ColorPanelComponent } from './color-panel.component';

fdescribe('ColorPanelComponent', () => {
    let component: ColorPanelComponent;
    let fixture: ComponentFixture<ColorPanelComponent>;
    const DEFAULT_COLOR = new Color('rgb(1,2,3)', 1);
    let colorService: ColorService;

    const CHANGED_OPACITY = 0.2;
    const CHANGED_RGB_VALUE = 'rgb(5,2,12)';
    let RGB_INDEX = 1;

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
        // tslint:disable-next-line: no-string-literal
        component['rgbArray'] = ['1', '2', '3'];
        component.color = DEFAULT_COLOR.rgbValue;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('click from main-color-button should toggle #selectColor ', () => {
        spyOn(component, 'selectColor');
        const mainColorButton = fixture.debugElement.query(By.css('.main-color-button'));
        mainColorButton.triggerEventHandler('click', null);
        expect(component.selectColor).toHaveBeenCalled();
    });

    it('click from secondary-color-button should toggle #selectColor', () => {
        spyOn(component, 'selectColor');
        const secondaryColorButton = fixture.debugElement.query(By.css('.secondary-color-button'));
        secondaryColorButton.triggerEventHandler('click', null);
        expect(component.selectColor).toHaveBeenCalled();
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

    it('should update a color correctly', () => {
        spyOn(colorService, 'updateColor');
        component.updateColor(DEFAULT_COLOR);
        expect(colorService.updateColor).toHaveBeenCalled();
        expect(component.openColorPicker).toBe(false);
    });

    it('should update previous colors when the rgb value has changed and opacity has not changed', () => {
        component.color = CHANGED_RGB_VALUE;
        component.opacity = 1;
        spyOn(colorService, 'updatePreviousColors');
        component.updatePreviousColors(DEFAULT_COLOR);
        expect(colorService.updatePreviousColors).toHaveBeenCalled();
    });

    it('should update previous colors when the rgb value has changed and opacity has changed', () => {
        component.color = CHANGED_RGB_VALUE;
        component.opacity = CHANGED_OPACITY;
        spyOn(colorService, 'updatePreviousColors');
        component.updatePreviousColors(DEFAULT_COLOR);
        expect(colorService.updatePreviousColors).toHaveBeenCalled();
    });

    it('should not update previous colors when the rgb value has not changed and opacity has changed', () => {
        const UNCHANGED_RGB_VALUE = 'rgb(1,2,3)';
        component.color = UNCHANGED_RGB_VALUE;
        component.opacity = CHANGED_OPACITY;
        spyOn(colorService, 'updatePreviousColors');
        component.updatePreviousColors(DEFAULT_COLOR);
        expect(colorService.updatePreviousColors).not.toHaveBeenCalled();
    });

    it('left click from previous-color should toggle #setPrimaryColor', () => {
        spyOn(component, 'setPrimaryColor');
        const previousColor = fixture.debugElement.query(By.css('.previous-color'));
        previousColor.triggerEventHandler('click', null);
        expect(component.setPrimaryColor).toHaveBeenCalled();
    });

    it('should set the primary color correctly', () => {
        const DEFAULT_INDEX = 3;
        spyOn(colorService, 'updateMainColor');
        component.setPrimaryColor(DEFAULT_INDEX);
        expect(colorService.updateMainColor).toHaveBeenCalled();
        expect(component.openColorPicker).toBe(false);
    });

    it('should close the color picker if the colopicker was opened', () => {
        component.openColorPicker = true;
        component.closeColorPicker();
        expect(component.openColorPicker).toBe(false);
    });

    it('right click from previous-color should toggle #setSecondaryColor', () => {
        spyOn(component, 'setSecondaryColor');
        const previousColor = fixture.debugElement.query(By.css('.previous-color'));
        previousColor.triggerEventHandler('contextmenu', null); // right click is contextmenu event
        expect(component.setSecondaryColor).toHaveBeenCalled();
    });

    it('should set the secondary color correctly', () => {
        const DEFAULT_INDEX = 3;
        spyOn(colorService, 'updateSecondaryColor');
        component.setSecondaryColor(DEFAULT_INDEX);
        expect(colorService.updateSecondaryColor).toHaveBeenCalled();
        expect(component.openColorPicker).toBe(false);
    });

    it('input event from opacity-slider should toggle #updateOpacity ', () => {
        component.openColorPicker = true;
        fixture.detectChanges();
        spyOn(component, 'updateOpacity');
        const opacitySlider = fixture.debugElement.query(By.css('.opacity-slider'));
        opacitySlider.triggerEventHandler('change', null);
        expect(component.updateOpacity).toHaveBeenCalled();
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
        RGB_INDEX = 0;
        expect(component.getRGB(RGB_INDEX)).toBe('1');

        // for the green value
        RGB_INDEX = 1;
        expect(component.getRGB(RGB_INDEX)).toBe('2');

        // for the blue value
        RGB_INDEX = 2;
        expect(component.getRGB(RGB_INDEX)).toBe('3');
    });

    it('should apply the rgb input correctly when a normal hex value is provided', () => {
        // Testing with a normal hex value (A)
        const NORMAL_HEX = 'A';
        component.applyRGBInput(NORMAL_HEX, 1);
        // tslint:disable-next-line: no-string-literal
        expect(component['rgbArray']).toEqual(['1', '10', '3']);
        expect(component.color).toBe('rgb(1,10,3)');
    });

    it('should apply the rgb input correctly when the minimum hex value is provided', () => {
        // Testing with a minmumum hex value (0)
        const MIMIMUM_HEX = '0';
        component.applyRGBInput(MIMIMUM_HEX, 1);
        // tslint:disable-next-line: no-string-literal
        expect(component['rgbArray']).toEqual(['1', '0', '3']);
        expect(component.color).toBe('rgb(1,0,3)');
    });

    // it('input event from rgb-input should toggle #applyRGBInput ', () => {
    //     component.openColorPicker = true;
    //     fixture.detectChanges();
    //     spyOn(component, 'applyRGBInput');
    //     const rgbInputs = fixture.debugElement.queryAll(By.css('.rgb-input'));
    //     rgbInputs[1].triggerEventHandler('input', null);
    //     expect(component.applyRGBInput).toHaveBeenCalled();
    // });

    it('should apply the rgb input correctly when a maximum hex value is provided', () => {
        // Testing with a maximum hex value (FF)
        const MAXIMUM_HEX = 'ff';
        component.applyRGBInput(MAXIMUM_HEX, 1);
        // tslint:disable-next-line: no-string-literal
        expect(component['rgbArray']).toEqual(['1', '255', '3']);
        expect(component.color).toBe('rgb(1,255,3)');
    });

    it('should not apply the rgb input when a hex value above FF provided', () => {
        const INCORRECT_HEX = 'AF4';
        component.applyRGBInput(INCORRECT_HEX, RGB_INDEX);
        // tslint:disable-next-line: no-string-literal
        expect(component['rgbArray']).toEqual(['1', '2', '3']);
        expect(component.color).toBe('rgb(1,2,3)');
        expect(component.rgbInputs[RGB_INDEX].inputError).toBe(true);
    });

    it('should not apply the rgb input when a minus sign "-" is provided ', () => {
        const INCORRECT_HEX = '-';
        component.applyRGBInput(INCORRECT_HEX, 1);
        // tslint:disable-next-line: no-string-literal
        expect(component['rgbArray']).toEqual(['1', '2', '3']);
        expect(component.color).toBe('rgb(1,2,3)');
    });

    it('should not apply the rgb input when the value provided is not a hex value', () => {
        const INCORRECT_HEX = 'm';
        component.applyRGBInput(INCORRECT_HEX, 1);
        // tslint:disable-next-line: no-string-literal
        expect(component['rgbArray']).toEqual(['1', '2', '3']);
        expect(component.color).toBe('rgb(1,2,3)');
    });

    it('should remove the input error if the incorrect input is changed to a correct one', () => {
        component.rgbInputs[RGB_INDEX].inputError = true;
        component.applyRGBInput('C', RGB_INDEX);
        expect(component.rgbInputs[RGB_INDEX].inputError).toBe(false);
    });
});
