import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';

@Injectable({
    providedIn: 'root',
})
export class ColorService {
    mainColor: Color;
    secondaryColor: Color;
    constructor() {
        //
    }
}
