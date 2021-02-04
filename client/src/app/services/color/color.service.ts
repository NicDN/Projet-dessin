import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';

@Injectable({
    providedIn: 'root',
})
export class ColorService {
    readonly START_POS_SHIFT = 8;
    mainColor: Color;
    secondaryColor: Color;

    previousColors: Color[] = [
        // initial values
        { rgbValue: 'rgb(255,0,0)', opacity: 100 },
        { rgbValue: 'rgb(0,0,255)', opacity: 100 },
        { rgbValue: 'rgb(255,255,51)', opacity: 100 },
        { rgbValue: 'rgb(102,204,0)', opacity: 100 },
        { rgbValue: 'rgb(204,0,102)', opacity: 100 },
        { rgbValue: 'rgb(96,96,96)', opacity: 100 },
        { rgbValue: 'rgb(204,255,255)', opacity: 100 },
        { rgbValue: 'rgb(0,0,51)', opacity: 100 },
        { rgbValue: 'rgb(255,128,0)', opacity: 100 },
        { rgbValue: 'rgb(255,153,153)', opacity: 100 },
    ];

    constructor() {
        this.mainColor = this.previousColors[0];
        this.secondaryColor = this.previousColors[1];
    }

    switchColors() {
        const tempColor = this.mainColor;
        this.mainColor = this.secondaryColor;
        this.secondaryColor = tempColor;
    }

    updateSecondaryColor(color: string, opacity: number) {
        this.secondaryColor.rgbValue = color;
        this.secondaryColor.opacity = opacity;
    }
    updateMainColor(color: string, opacity: number) {
        this.mainColor.rgbValue = color;
        this.mainColor.opacity = opacity;
    }

    updatePreviousColors(color: string, opacity: number) {
        for (var i = this.START_POS_SHIFT; i > 0; i--) {
            this.previousColors[i + 1] = this.previousColors[i];
        }
        //this.previousColors[0]=new Color(color,opacity);
        // ne fonctionne pas bien 
    }

    updateColor(selectedColor: Color, color: string, opacity: number) {
        if (selectedColor == this.mainColor) {
            this.updateMainColor(color, opacity);
        } else if (selectedColor == this.secondaryColor) {
            this.updateSecondaryColor(color, opacity);
        }
        this.updatePreviousColors(color,opacity);
    }
}
