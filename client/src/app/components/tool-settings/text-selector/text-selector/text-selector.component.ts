import { Component, OnInit } from '@angular/core';
import { SliderSetting } from '@app/classes/slider-setting';
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

    constructor(public textService: TextService) {}

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
            setEffect: () => (this.textService.writeItalic = !this.textService.writeItalic),
        },

        {
            icon: 'bold',
            toolTipContent: 'Gras',
            setEffect: () => (this.textService.writeBold = !this.textService.writeBold),
        },
    ];

    fontStyles: FontStyleOption[] = [
        { name: 'Arial', value: FontStyle.Arial },
        { name: 'Times', value: FontStyle.Times },
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

    setActiveTextPosition(textPositon: TextPositon): void {
        this.textService.textPosition = textPositon;
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
    }
}
