import { Injectable } from '@angular/core';
import { TraceTool } from '@app/classes/trace-tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

export enum TextPositon {
    Center,
    Left,
    Right,
}

export enum FontStyle {
    Arial,
    Times,
    // TODO: ... minimum 5 font styles
}

@Injectable({
    providedIn: 'root',
})
export class TextService extends TraceTool {
    readonly TEXT_MIN_SIZE: number = 4; // TODO: arbitrary values, change them accordingly
    readonly TEXT_MAX_SIZE: number = 30; // TODO: arbitrary values, change them accordingly

    textSize: number = this.TEXT_MIN_SIZE;
    textPosition: TextPositon = TextPositon.Left;

    writeItalic: boolean = false;
    writeBold: boolean = false;

    fontStyle: FontStyle;

    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService, 'Texte');
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_text
}
