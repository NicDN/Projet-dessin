import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSliderChange } from '@angular/material/slider';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Color } from '@app/classes/color';
import { ColorService } from '@app/services/color/color.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { ColorPanelComponent } from './color-panel.component';

// tslint:disable:no-string-literal
// tslint:disable: no-any
describe('ColorPanelComponent', () => {
    let component: ColorPanelComponent;
    let fixture: ComponentFixture<ColorPanelComponent>;
    const DEFAULT_COLOR: Color = { rgbValue: 'rgb(1,2,3)', opacity: 1 };
    const DEFAULT_RGB_ARRAY = ['1', '2', '3'];
    let colorService: ColorService;

    let routerSpy: jasmine.SpyObj<Router>;
    let hotkeyServiceSpy: jasmine.SpyObj<HotkeyService>;

    const CHANGED_RGB_VALUE = 'rgb(5,2,12)';
    let RGB_INDEX = 1;

    beforeEach(async(() => {
        routerSpy = jasmine.createSpyObj('Router', ['']);
        hotkeyServiceSpy = jasmine.createSpyObj('HotkeyService', ['']);

        TestBed.configureTestingModule({
            declarations: [ColorPanelComponent],
            imports: [MatDialogModule],
            providers: [ColorService, { provide: Router, useValue: routerSpy }, { provide: HotkeyService, useValue: hotkeyServiceSpy }],
            schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        colorService = TestBed.inject(ColorService);
        component['rgbArray'] = ['1', '2', '3'];
        component.rgbValue = DEFAULT_COLOR.rgbValue;
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

    it('#selectColor should select a color correctly', () => {
        spyOn(component, 'clearInputErrors');
        component.selectColor(DEFAULT_COLOR);
        expect(component.selectedColor).toBe(DEFAULT_COLOR);
        expect(component.rgbValue).toBe(DEFAULT_COLOR.rgbValue);
        expect(component.opacity).toBe(DEFAULT_COLOR.opacity);
        expect(component.hue).toBe(DEFAULT_COLOR.rgbValue);
        expect(component.openColorPicker).toBeTrue();
        expect(component.clearInputErrors).toHaveBeenCalled();
    });

    it('#switchColors should switch colors correctly', () => {
        spyOn(colorService, 'switchColors');
        component.switchColors();
        expect(colorService.switchColors).toHaveBeenCalled();
        expect(component.openColorPicker).toBeFalse();
    });

    it('#updateColor should update a color correctly', () => {
        component.openColorPicker = true;
        const updateColorSpy = spyOn(colorService, 'updateColor');
        const updatePreviousColorsSpy = spyOn<any>(component, 'updatePreviousColors');
        component.updateColor(DEFAULT_COLOR);
        expect(updatePreviousColorsSpy).toHaveBeenCalled();
        expect(updateColorSpy).toHaveBeenCalled();
        expect(component.openColorPicker).toBeFalse();
    });

    it('#updatePreviousColors should update previous colors when the rgb value has changed', () => {
        component.rgbValue = CHANGED_RGB_VALUE;
        spyOn(colorService, 'updatePreviousColors');
        component['updatePreviousColors'](DEFAULT_COLOR);
        expect(colorService.updatePreviousColors).toHaveBeenCalled();
    });

    it('#updatePreviousColors should not update previous colors when the rgb value has not changed', () => {
        const UNCHANGED_RGB_VALUE = DEFAULT_COLOR.rgbValue;
        component.rgbValue = UNCHANGED_RGB_VALUE;
        spyOn(colorService, 'updatePreviousColors');
        component['updatePreviousColors'](DEFAULT_COLOR);
        expect(colorService.updatePreviousColors).not.toHaveBeenCalled();
    });

    it('left click from previous-color should toggle #setPrimaryColor', () => {
        spyOn(component, 'setPrimaryColor');
        const previousColor = fixture.debugElement.query(By.css('.previous-color'));
        previousColor.triggerEventHandler('click', null);
        expect(component.setPrimaryColor).toHaveBeenCalled();
    });

    it('#setPrimaryColor should set the primary color correctly', () => {
        const DEFAULT_INDEX = 3;
        spyOn(colorService, 'updateMainColor');
        spyOn<any>(component, 'closeColorPicker');
        component.setPrimaryColor(DEFAULT_INDEX);
        expect(colorService.updateMainColor).toHaveBeenCalled();
        expect(component['closeColorPicker']).toHaveBeenCalled();
    });

    it('#closeColorPicker should close the color picker if the colopicker was opened', () => {
        component.openColorPicker = true;
        component['closeColorPicker']();
        expect(component.openColorPicker).toBeFalse();
    });

    it('#closeColorPicker should not close the color picker if the colopicker was already closed', () => {
        component.openColorPicker = false;
        component['closeColorPicker']();
        expect(component.openColorPicker).toBeFalse();
    });

    it('right click from previous-color should toggle #setSecondaryColor', () => {
        spyOn(component, 'setSecondaryColor');
        const previousColor = fixture.debugElement.query(By.css('.previous-color'));
        previousColor.triggerEventHandler('contextmenu', null); // right click is contextmenu event
        expect(component.setSecondaryColor).toHaveBeenCalled();
    });

    it('#setSecondaryColor should set the secondary color correctly', () => {
        const DEFAULT_INDEX = 3;
        spyOn(colorService, 'updateSecondaryColor');
        spyOn<any>(component, 'closeColorPicker');
        component.setSecondaryColor(DEFAULT_INDEX);
        expect(colorService.updateSecondaryColor).toHaveBeenCalled();
        expect(component['closeColorPicker']).toHaveBeenCalled();
    });

    it('input event from opacity-slider should toggle #updateOpacity ', () => {
        component.openColorPicker = true;
        fixture.detectChanges();
        spyOn(component, 'updateOpacity');
        const opacitySlider = fixture.debugElement.query(By.css('.opacity-slider'));
        opacitySlider.triggerEventHandler('input', null);
        expect(component.updateOpacity).toHaveBeenCalled();
    });

    it('#updateOpacity should update opacity correctly', () => {
        const matSliderChange = new MatSliderChange();
        const MAT_SLIDER_CHANGE_DEFAULT_VALUE = 50;
        const OPACITY_EXPECTED_VALUE = 0.5;
        matSliderChange.value = MAT_SLIDER_CHANGE_DEFAULT_VALUE;
        component.updateOpacity(matSliderChange);
        expect(component.opacity).toBe(OPACITY_EXPECTED_VALUE);
    });

    it('#getRGB should get a rgb value correctly', () => {
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

    it('#applyRGBInput applies input if the input has no error', () => {
        component['rgbArray'] = DEFAULT_RGB_ARRAY;
        component.rgbValue = DEFAULT_COLOR.rgbValue;
        const CORRECT_INPUT = 'A';
        const EXPECTED_RGB_ARRAY = ['1', '10', '3']; // hex(A) = 10
        const EXPECTED_RGB_VALUE = 'rgb(1,10,3)';
        RGB_INDEX = 1;
        spyOn(component, 'clearInputErrors');
        spyOn<any>(component, 'inputHasErrors').and.returnValue(false);
        component.applyRGBInput(CORRECT_INPUT, RGB_INDEX);
        expect(component.rgbInputs[RGB_INDEX].inputError).toBeFalse();
        expect(component['rgbArray']).toEqual(EXPECTED_RGB_ARRAY);
        expect(component.rgbValue).toBe(EXPECTED_RGB_VALUE);
    });

    it('#applyRGBInput does not apply input if the input has error', () => {
        const INCORRECT_INPUT = 'x';
        component['rgbArray'] = DEFAULT_RGB_ARRAY;
        component.rgbValue = DEFAULT_COLOR.rgbValue;
        RGB_INDEX = 1;
        spyOn(component, 'clearInputErrors');
        spyOn<any>(component, 'inputHasErrors').and.returnValue(true);
        component.applyRGBInput(INCORRECT_INPUT, RGB_INDEX);
        expect(component.rgbInputs[RGB_INDEX].inputError).toBeTrue();
        expect(component['rgbArray']).toBe(DEFAULT_RGB_ARRAY);
        expect(component.rgbValue).toBe(DEFAULT_COLOR.rgbValue);
        expect(component.clearInputErrors).not.toHaveBeenCalled();
    });

    it('#applyRGBInput should remove a error at given index if the error is corrected', () => {
        component['rgbInputs'][RGB_INDEX].inputError = true;
        spyOn<any>(component, 'inputHasErrors').and.returnValue(false);
        component.applyRGBInput('test', RGB_INDEX);
        expect(component['rgbInputs'][RGB_INDEX].inputError).toBeFalse();
    });

    it('#inputHasErrors should not return error when normal hex value is provided', () => {
        // Testing with a normal hex value (A)
        const NORMAL_HEX = 'A';
        expect(component['inputHasErrors'](NORMAL_HEX)).toBeFalse();
    });

    it('#inputHasErrors should not return error when minimum hex value is provided', () => {
        // Testing with a minmumum hex value (0)
        const MIMIMUM_HEX = '0';
        expect(component['inputHasErrors'](MIMIMUM_HEX)).toBeFalse();
    });

    it('#inputHasErrors should not return error when maximum hex value is provided', () => {
        // Testing with a maximum hex value (FF)
        const MAXIMUM_HEX = 'ff';
        expect(component['inputHasErrors'](MAXIMUM_HEX)).toBeFalse();
    });

    it('#inputHasErrors should return error when the value provided is not a hex', () => {
        const INCORRECT_HEX = 'm';
        expect(component['inputHasErrors'](INCORRECT_HEX)).toBeTrue();
    });

    it('#inputHasErrors should return error when the value provided is empty', () => {
        const EMPTY_HEX = '';
        expect(component['inputHasErrors'](EMPTY_HEX)).toBeTrue();
    });

    it('#clearInputErrors should clear input errors correctly', () => {
        // case 1: no errors in rgbInputs
        component.clearInputErrors();
        for (const rgbInput of component.rgbInputs) {
            expect(rgbInput.inputError).toBeFalse();
        }
        // case 2: errors in rgbInputs
        for (const rgbInput of component.rgbInputs) {
            rgbInput.inputError = true;
        }
        component.clearInputErrors();
        for (const rgbInput of component.rgbInputs) {
            expect(rgbInput.inputError).toBeFalse();
        }
    });

    it('#rgbInputHasErrors should return false is rgbInputs does not contain error', () => {
        component.rgbInputs = [
            { color: 'Rouge', inputError: false },
            { color: 'Vert', inputError: false },
            { color: 'Bleu', inputError: false },
        ];

        expect(component.rgbInputHasErrors()).toBeFalse();
    });

    it('#rgbInputHasErrors should return true is rgbInputs does contain errors', () => {
        component.rgbInputs = [
            { color: 'Rouge', inputError: true },
            { color: 'Vert', inputError: false },
            { color: 'Bleu', inputError: false },
        ];

        expect(component.rgbInputHasErrors()).toBeTrue();
    });
});
