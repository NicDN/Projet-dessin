import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';
// import { MatSliderChange } from '@angular/material/slider';
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

    readonly rgbIndexArray: number[] = [0, 1, 2];

    colorService: ColorService;
    previousColors: Color[];

    selectedColor: Color;
    openColorPicker: boolean = false;

    color: string;
    hue: string;
    opacity: number;

    rgbArray: RegExpMatchArray | null;

    formControl: FormControl = new FormControl('', [Validators.max(this.MAX_RGB_VALUE), Validators.min(0)]);

    constructor(colorService: ColorService) {
        this.colorService = colorService;
        this.previousColors = this.colorService.previousColors;
    }

    selectColor(color: Color): void {
        this.selectedColor = color;
        this.color = this.selectedColor.rgbValue;
        this.opacity = this.selectedColor.opacity;
        this.hue = this.selectedColor.rgbValue;

        this.openColorPicker = true;
        this.rgbArray = this.color.match(/\d+/g);
    }

    switchColors(): void {
        this.colorService.switchColors();
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
        this.rgbArray = this.color.match(/\d+/g);
        // tslint:disable-next-line: no-non-null-assertion
        return this.rgbArray![rgbIndex];
    }

    applyRGBInput(input: string, rgbIndex: number): void {
        // tslint:disable-next-line: no-non-null-assertion
        this.rgbArray![rgbIndex] = input;
        this.color = `rgb(${this.rgbArray})`;
    }
}
