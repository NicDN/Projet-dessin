import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { Vec2 } from '@app/classes/vec2';
import { FontStyle, TextPosition, TextService } from '@app/services/tools/text/text.service';

export interface TextProperties {
    textContext: CanvasRenderingContext2D;
    text: string;
    initialClickPosition: Vec2;
    enterPosition: number[];
    fontStyle: FontStyle;
    writeBold: boolean;
    writeItalic: boolean;
    textSize: number;
    textPosition: TextPosition;
}

export class TextCommand extends AbstractCommand {
    constructor(private textService: TextService, private textPropreties: TextPropreties) {
        super();
    }
    execute(): void {
        this.textPropreties.drawText(this.textPropreties);
    }
}
