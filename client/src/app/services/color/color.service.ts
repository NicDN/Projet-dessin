import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';

const DEFAULTCOLOR = 'black';
const DEFAULTOPACITY = 1;

@Injectable({
    providedIn: 'root',
})
export class ColorService {
    mainColor: Color = { rgbValue: DEFAULTCOLOR, opacity: DEFAULTOPACITY };
    secondaryColor: Color = { rgbValue: 'red', opacity: DEFAULTOPACITY };
}
