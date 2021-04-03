import { Component, OnInit } from '@angular/core';
import { SliderSetting } from '@app/classes/slider-setting';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FontStyle, TextPositon, TextService } from '@app/services/tools/text/text.service';

interface TextPositionOption {
    icon: string;
    toolTipContent: string;
    textPositon: TextPositon;
}

interface TextEffect {
    icon: string;
    toolTipContent: string;
    setEffect: () => void;
}

interface FontStyleOption {
    name: string;
    value: FontStyle;
}

@Component({
    selector: 'app-text-selector',
    templateUrl: './text-selector.component.html',
    styleUrls: ['./text-selector.component.scss'],
})
export class TextSelectorComponent implements OnInit {
    textSizeSetting: SliderSetting;

    constructor(public textService: TextService, public drawingService: DrawingService) {}

    textPositionOptions: TextPositionOption[] = [
        {
            icon: 'align-left',
            toolTipContent: 'Gauche',
            textPositon: TextPositon.Left,
        },

        {
            icon: 'align-center',
            toolTipContent: 'Centre',
            textPositon: TextPositon.Center,
        },

        {
            icon: 'align-right',
            toolTipContent: 'Droite',
            textPositon: TextPositon.Right,
        },
    ];

    textEffects: TextEffect[] = [
        {
            icon: 'italic',
            toolTipContent: 'Italique',
            setEffect: () => this.changeWriteItalic(),
        },

        {
            icon: 'bold',
            toolTipContent: 'Gras',
            setEffect: () => this.changeWriteBold(),
        },
    ];

    fontStyles: FontStyleOption[] = [
        { name: 'Arial', value: FontStyle.Arial },
        { name: 'Times', value: FontStyle.Times },
        { name: 'Comic Sans MS', value: FontStyle.Comic },
        { name: 'Consolas', value: FontStyle.Consolas },
        { name: 'Bembo', value: FontStyle.Bembo },
    ];

    ngOnInit(): void {
        this.textSizeSetting = {
            title: 'Taille de la police',
            unit: 'pixels',
            min: this.textService.TEXT_MIN_SIZE,
            max: this.textService.TEXT_MAX_SIZE,
            getAttribute: () => {
                return this.textService.textSize;
            },
            action: (value: number) => {
                this.textService.textSize = value;
            },
        };
    }

    changeWriteBold(): void {
        this.textService.writeBold = !this.textService.writeBold;
        this.updateText();
    }
    changeWriteItalic(): void {
        this.textService.writeItalic = !this.textService.writeItalic;
        this.updateText();
    }

    setActiveTextPosition(textPositon: TextPositon): void {
        this.textService.textPosition = textPositon;
        this.updateText();
    }

    checkActiveEffect(icon: string): boolean {
        if (icon === 'italic') {
            return this.textService.writeItalic;
        } else {
            return this.textService.writeBold;
        }
    }

    applyFontStyle(fontStyle: FontStyle): void {
        this.textService.fontStyle = fontStyle;
        this.updateText();
    }

    updateText(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.textService.drawText(this.drawingService.previewCtx, this.textService.writtenOnPreview);
    }
}
