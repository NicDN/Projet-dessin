import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';

@Injectable({
    providedIn: 'root',
})
export class ColorService {
    mainColor: Color = {} as Color;
    secondaryColor: Color = {} as Color;

    previousColors: Color[] = [
        { rgbValue: 'rgb(255,0,0)', opacity: 1 },
        { rgbValue: 'rgb(0,0,255)', opacity: 1 },
        { rgbValue: 'rgb(255,255,51)', opacity: 1 },
        { rgbValue: 'rgb(102,204,0)', opacity: 1 },
        { rgbValue: 'rgb(204,0,102)', opacity: 1 },
        { rgbValue: 'rgb(96,96,96)', opacity: 1 },
        { rgbValue: 'rgb(204,255,255)', opacity: 1 },
        { rgbValue: 'rgb(0,0,51)', opacity: 1 },
        { rgbValue: 'rgb(255,128,0)', opacity: 1 },
        { rgbValue: 'rgb(255,153,153)', opacity: 1 },
    ];

    constructor() {
        this.mainColor = { rgbValue: this.previousColors[0].rgbValue, opacity: this.previousColors[0].opacity };
        this.secondaryColor = { rgbValue: this.previousColors[1].rgbValue, opacity: this.previousColors[1].opacity };
    }

    switchColors(): void {
        const tempColor = this.mainColor;
        this.mainColor = this.secondaryColor;
        this.secondaryColor = tempColor;
    }

    updateSecondaryColor(color: Color): void {
        this.secondaryColor.rgbValue = color.rgbValue;
        this.secondaryColor.opacity = color.opacity;
    }

    updateMainColor(color: Color): void {
        this.mainColor.rgbValue = color.rgbValue;
        this.mainColor.opacity = color.opacity;
    }

    updatePreviousColors(color: Color): void {
        this.previousColors.pop();
        this.previousColors.unshift({ rgbValue: color.rgbValue, opacity: color.opacity });
    }

    updateColor(selectedColor: Color, newColor: Color): void {
        if (selectedColor === this.mainColor) {
            this.updateMainColor(newColor);
        } else if (selectedColor === this.secondaryColor) {
            this.updateSecondaryColor(newColor);
        }
    }
}
