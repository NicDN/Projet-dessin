import { Component, OnInit } from '@angular/core';
// import { MatSliderChange } from '@angular/material/slider';
import { Color } from '@app/classes/color';
import { ColorService } from '@app/services/color/color.service';

@Component({
    selector: 'app-color-panel',
    templateUrl: './color-panel.component.html',
    styleUrls: ['./color-panel.component.scss'],
})
export class ColorPanelComponent implements OnInit {
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

    ngOnInit(): void {}

    selectColor(color: Color) {
        this.selectedColor = color;
        this.color = this.selectedColor.rgbValue;
        this.opacity = this.selectedColor.opacity;
        this.hue = this.selectedColor.rgbValue;

        this.openColorPicker = true;
    }

    switchColors() {
        this.colorService.switchColors();
    }

    updateColor(selectedColor: Color) {
        this.colorService.updateColor(selectedColor,this.color,this.opacity);
        this.openColorPicker = false;
    }

    setPrimaryColor(index: number) {
        this.colorService.mainColor = this.colorService.previousColors[index];
        if (this.openColorPicker) {
            this.openColorPicker = false;
        }
    }

    setSecondaryColor(index: number) {
        this.colorService.secondaryColor = this.colorService.previousColors[index];
        if (this.openColorPicker) {
            this.openColorPicker = false;
        }
    }
}
