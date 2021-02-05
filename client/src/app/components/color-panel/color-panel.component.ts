import { Component } from '@angular/core';
// import { MatSliderChange } from '@angular/material/slider';
import { Color } from '@app/classes/color';
import { ColorService } from '@app/services/color/color.service';

@Component({
    selector: 'app-color-panel',
    templateUrl: './color-panel.component.html',
    styleUrls: ['./color-panel.component.scss'],
})
export class ColorPanelComponent {
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

    getButtonStyle(color: string, opacity: number) {
        return {
            'background-color': color,
            opacity: opacity / 100,
        };
    }

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
        this.colorService.updateColor(selectedColor, this.color, this.opacity);
        this.openColorPicker = false;
    }

    setPrimaryColor(index: number): void {
        this.colorService.mainColor = this.colorService.previousColors[index];
        if (this.openColorPicker) {
            this.openColorPicker = false;
        }
    }

    setSecondaryColor(index: number): void {
        this.colorService.secondaryColor = this.colorService.previousColors[index];
        if (this.openColorPicker) {
            this.openColorPicker = false;
        }
    }
}
