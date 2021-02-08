import { Component } from '@angular/core';
import { FormBuilder} from '@angular/forms';
// import { FormControl, Validators } from '@angular/forms';
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

    color: string;
    hue: string;
    opacity: number;

    rgbArray: string[];

    constructor(colorService: ColorService, public formBuilder: FormBuilder) {
        this.colorService = colorService;
        this.previousColors = this.colorService.previousColors;
    }

    selectColor(color: Color): void {
        this.selectedColor = color;
        this.color = this.selectedColor.rgbValue;
        this.opacity = this.selectedColor.opacity;
        this.hue = this.selectedColor.rgbValue;

        this.openColorPicker = !this.openColorPicker;
    }

    switchColors(): void {
        this.colorService.switchColors();
        this.openColorPicker = false;
    }

    updateColor(selectedColor: Color): void {
        const previousOpacity = selectedColor.opacity;
        const prevousRGBValue = selectedColor.rgbValue;
        this.colorService.updateColor(selectedColor, this.color, this.opacity);

        if ((previousOpacity !== this.opacity || previousOpacity === this.opacity) && prevousRGBValue !== this.color) {
            this.colorService.updatePreviousColors(this.color, this.opacity);
        }
        this.openColorPicker = false;
    }

    setPrimaryColor(index: number): void {
        this.colorService.updateMainColor(this.colorService.previousColors[index].rgbValue, this.colorService.previousColors[index].opacity);
        if (this.openColorPicker) {
            this.openColorPicker = false;
        }
    }

    setSecondaryColor(index: number): void {
        this.colorService.updateSecondaryColor(this.colorService.previousColors[index].rgbValue, this.colorService.previousColors[index].opacity);
        if (this.openColorPicker) {
            this.openColorPicker = false;
        }
    }

    updateOpacity(event: MatSliderChange): void {
        this.opacity = (event.value as number) / this.OPACITY_AJUSTMENT;
    }

    getOpacity(): number {
        return this.opacity * this.OPACITY_AJUSTMENT;
    }

    getRGB(rgbIndex: number): string {
        this.rgbArray = this.color
            .substring(this.CONCATENATE_OFFSET, this.color.length - 1)
            .replace(/ /, '')
            .split(',');
        return this.rgbArray[rgbIndex];
    }

    applyRGBInput(input: string, rgbIndex: number): void {
        if (Number(input) <= this.MAX_RGB_VALUE) {
            this.rgbArray[rgbIndex] = input;
            this.color = `rgb(${this.rgbArray})`;
            if (this.rgbInputs[rgbIndex].inputError) {
                this.rgbInputs[rgbIndex].inputError = false;
            }
        } else {
            this.rgbInputs[rgbIndex].inputError = true;
        }
    }
}
