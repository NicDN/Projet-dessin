import { Color } from '@app/classes/color';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { Vec2 } from '@app/classes/vec2';
import { FontStyle, TextPosition, TextService } from '@app/services/tools/text/textService/text.service';

export interface TextProperties {
    textContext: CanvasRenderingContext2D;
    writtenOnPreview: string;
    initialClickPosition: Vec2;
    enterPosition: number[];
    fontStyle: FontStyle;
    writeBold: boolean;
    writeItalic: boolean;
    textSize: number;
    textPosition: TextPosition;
    color: Color;
}

export class TextCommand extends AbstractCommand {
    constructor(private textService: TextService, private textProperties: TextProperties) {
        super();
    }
    execute(): void {
        this.textService.drawText(this.textProperties);
    }
}
