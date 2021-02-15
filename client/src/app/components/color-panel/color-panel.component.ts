import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Color } from '@app/classes/color';
import { ColorService } from '@app/services/color/color.service';

@Component({
    selector: 'app-color-panel',
    templateUrl: './color-panel.component.html',
    styleUrls: ['./color-panel.component.scss'],
})
export class ColorPanelComponent {
    readonly OPACITY_AJUSTMENT: number = 100;
    readonly MAX_RGB_VALUE: number = 255;
    readonly CONCATENATE_OFFSET: number = 4;

    rgbInputs: { color: string; inputError: boolean }[] = [
        { color: 'Rouge', inputError: false },
        { color: 'Vert', inputError: false },
        { color: 'Bleu', inputError: false },
    ];

    colorService: ColorService;
    previousColors: Color[];

    selectedColor: Color;
    openColorPicker: boolean = false;

    rgbValue: string;
    hue: string;
    opacity: number;

    private rgbArray: string[]; // represents R/G/B decimal values

    constructor(colorService: ColorService) {
        this.colorService = colorService;
        this.previousColors = this.colorService.previousColors;
    }
    selectColor(color: Color): void {
        this.selectedColor = color;
        this.rgbValue = this.selectedColor.rgbValue;
        this.opacity = this.selectedColor.opacity;
        this.hue = this.selectedColor.rgbValue;

        this.clearInputErrors();
        this.openColorPicker = !this.openColorPicker;
    }

    clearInputErrors(): void {
        for (const rgbInput of this.rgbInputs) {
            if (rgbInput.inputError) {
                rgbInput.inputError = false;
            }
        }
    }

    switchColors(): void {
        this.colorService.switchColors();
        this.openColorPicker = false;
    }

    updateColor(selectedColor: Color): void {
        this.updatePreviousColors(selectedColor);
        this.colorService.updateColor(selectedColor, this.rgbValue, this.opacity);
        this.openColorPicker = false;
    }

    updatePreviousColors(selectedColor: Color): void {
        if (selectedColor.rgbValue !== this.rgbValue) {
            this.colorService.updatePreviousColors(this.rgbValue, this.opacity);
        }
    }

    setPrimaryColor(index: number): void {
        this.colorService.updateMainColor(this.colorService.previousColors[index].rgbValue, this.colorService.previousColors[index].opacity);
        this.closeColorPicker();
    }

    setSecondaryColor(index: number): void {
        this.colorService.updateSecondaryColor(this.colorService.previousColors[index].rgbValue, this.colorService.previousColors[index].opacity);
        this.closeColorPicker();
    }

    closeColorPicker(): void {
        if (this.openColorPicker) {
            this.openColorPicker = false;
        }
    }

    updateOpacity(event: MatSliderChange): void {
        this.opacity = (event.value as number) / this.OPACITY_AJUSTMENT;
    }

    getRGB(rgbIndex: number): string {
        this.rgbArray = this.rgbValue
            .substring(this.CONCATENATE_OFFSET, this.rgbValue.length - 1)
            .replace(/ /, '')
            .split(',');

        return Number(this.rgbArray[rgbIndex]).toString(16);
    }

    applyRGBInput(input: string, rgbIndex: number): void {
        const convertedHexToNumber: number = parseInt(input, 16);
        if (this.inputHasErrors(input)) {
            this.rgbInputs[rgbIndex].inputError = true;
            return;
        }
        this.rgbArray[rgbIndex] = '' + convertedHexToNumber;
        this.rgbValue = `rgb(${this.rgbArray})`;
        if (this.rgbInputs[rgbIndex].inputError) {
            this.rgbInputs[rgbIndex].inputError = false;
        }
    }

    inputHasErrors(input: string): boolean {
        if (input === '') {
            return true;
        }
        for (const char of input) {
            if (Number.isNaN(parseInt(char, 16))) {
                return true;
            }
        }
        return false;
    }
}
