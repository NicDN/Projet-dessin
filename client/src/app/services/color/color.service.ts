import { Injectable } from '@angular/core';
import { Color } from '../../classes/color';

@Injectable({
    providedIn: 'root',
})
export class ColorService {
    private mainColor:Color;
    private secondaryColor:Color;
    constructor() {}
}
