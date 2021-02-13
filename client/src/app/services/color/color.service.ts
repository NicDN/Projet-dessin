import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';

@Injectable({
    providedIn: 'root',
})
export class ColorService {
    mainColor: Color;
    secondaryColor: Color;

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
        this.mainColor = new Color(this.previousColors[0].rgbValue, this.previousColors[0].opacity);
        this.secondaryColor = new Color(this.previousColors[1].rgbValue, this.previousColors[1].opacity);
    }

    switchColors(): void {
        const tempColor = this.mainColor;
        this.mainColor = this.secondaryColor;
        this.secondaryColor = tempColor;
    }

    updateSecondaryColor(color: string, opacity: number): void {
        this.secondaryColor.rgbValue = color;
        this.secondaryColor.opacity = opacity;
    }

    updateMainColor(color: string, opacity: number): void {
        this.mainColor.rgbValue = color;
        this.mainColor.opacity = opacity;
    }

    updatePreviousColors(color: string, opacity: number): void {
        this.previousColors.pop();
        this.previousColors.unshift(new Color(color, opacity));
    }

    updateColor(selectedColor: Color, color: string, opacity: number): void {
        if (selectedColor === this.mainColor) {
            this.updateMainColor(color, opacity);
        } else if (selectedColor === this.secondaryColor) {
            this.updateSecondaryColor(color, opacity);
        }
    }
}
