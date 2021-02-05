import { Component } from '@angular/core';
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

    colorService: ColorService;
    previousColors: Color[];

    selectedColor: Color;
    openColorPicker: boolean = false;

    // red: string;
    // green: string;
    // blue: string;

    hue: string;
    color: string;
    opacity: number;

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
}
