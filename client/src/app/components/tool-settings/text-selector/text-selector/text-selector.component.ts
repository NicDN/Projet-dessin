import { Component, OnInit } from '@angular/core';
import { SliderSetting } from '@app/classes/slider-setting';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FontStyle, TextPosition, TextService } from '@app/services/tools/text/textService/text.service';

interface TextPositionOption {
    icon: string;
    toolTipContent: string;
    textPositon: TextPosition;
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
    fontStyles: FontStyleOption[] = [
        { name: 'Arial', value: FontStyle.Arial },
        { name: 'Times', value: FontStyle.Times },
        { name: 'Comic Sans MS', value: FontStyle.Comic },
        { name: 'Calibri', value: FontStyle.Calibri },
        { name: 'Georgia', value: FontStyle.Georgia },
    ];

    textSizeSetting: SliderSetting;
    selectedFontStyle: string = this.fontStyles[0].name;

    constructor(public textService: TextService, private drawingService: DrawingService) {}

    textPositionOptions: TextPositionOption[] = [
        {
            icon: 'align-left',
            toolTipContent: 'Gauche',
            textPositon: TextPosition.Left,
        },

        {
            icon: 'align-center',
            toolTipContent: 'Centre',
            textPositon: TextPosition.Center,
        },

        {
            icon: 'align-right',
            toolTipContent: 'Droite',
            textPositon: TextPosition.Right,
        },
    ];

    textEffects: TextEffect[] = [
        {
            icon: 'italic',
            toolTipContent: 'Italique',
            setEffect: () => this.changeTextEffect('italic'),
        },

        {
            icon: 'bold',
            toolTipContent: 'Gras',
            setEffect: () => this.changeTextEffect('bold'),
        },
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
                this.updateText();
            },
        };
    }

    private changeTextEffect(textOption: string): void {
        textOption === 'italic'
            ? (this.textService.writeItalic = !this.textService.writeItalic)
            : (this.textService.writeBold = !this.textService.writeBold);

        this.updateText();
    }

    setActiveTextPosition(textPositon: TextPosition): void {
        this.textService.textPosition = textPositon;
        this.updateText();
    }

    checkActiveTextEffect(icon: string): boolean {
        return icon === 'italic' ? this.textService.writeItalic : this.textService.writeBold;
    }

    applyFontStyle(fontStyle: FontStyleOption): void {
        this.selectedFontStyle = fontStyle.name;
        this.textService.fontStyle = fontStyle.value;
        this.updateText();
    }

    private updateText(): void {
        if (this.textService.isWriting) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.textService.registerTextCommand(this.drawingService.previewCtx, this.textService.writtenOnPreview);
            this.textService.drawBox();
        }
    }
}
