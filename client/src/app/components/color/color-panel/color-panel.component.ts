import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Color } from '@app/classes/color';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { TextService } from '@app/services/tools/text/textService/text.service';
import { ToolsService } from '@app/services/tools/tools.service';

interface RGBInput {
    color: string;
    inputError: boolean;
}

@Component({
    selector: 'app-color-panel',
    templateUrl: './color-panel.component.html',
    styleUrls: ['./color-panel.component.scss'],
})
export class ColorPanelComponent {
    readonly OPACITY_AJUSTMENT: number = 100;
    private readonly CONCATENATE_OFFSET: number = 4;

    rgbInputs: RGBInput[] = [
        { color: 'Rouge', inputError: false },
        { color: 'Vert', inputError: false },
        { color: 'Bleu', inputError: false },
    ];

    rgbInputError: boolean = true;

    previousColors: Color[] = [];

    selectedColor: Color = {} as Color;
    openColorPicker: boolean = false;
    clickedOutise: boolean = false;

    rgbValue: string = '';
    hue: string = '';
    opacity: number = 0;

    private rgbArray: string[]; // represents R/G/B decimal values

    constructor(
        public colorService: ColorService,
        public hotKeyService: HotkeyService,
        private toolsService: ToolsService,
        private drawingService: DrawingService,
    ) {
        this.colorService = colorService;
        this.previousColors = this.colorService.previousColors;
    }

    selectColor(color: Color): void {
        this.selectedColor = color;
        this.rgbValue = this.selectedColor.rgbValue;
        this.opacity = this.selectedColor.opacity;
        this.hue = this.selectedColor.rgbValue;

        this.clearInputErrors();
        this.openColorPicker = !this.openColorPicker;
    }

    clearInputErrors(): void {
        for (const rgbInput of this.rgbInputs) {
            if (rgbInput.inputError) {
                rgbInput.inputError = false;
            }
        }
    }

    rgbInputHasErrors(): boolean {
        for (const rgbInput of this.rgbInputs) {
            if (rgbInput.inputError) {
                return true;
            }
        }
        return false;
    }

    switchColors(): void {
        this.colorService.switchColors();
        this.openColorPicker = false;
        this.updateText();
    }

    updateColor(selectedColor: Color): void {
        this.updatePreviousColors(selectedColor);
        this.colorService.updateColor(selectedColor, { rgbValue: this.rgbValue, opacity: this.opacity });
        this.openColorPicker = false;
        this.updateText();
    }

    private updatePreviousColors(selectedColor: Color): void {
        if (selectedColor.rgbValue !== this.rgbValue) {
            this.colorService.updatePreviousColors({ rgbValue: this.rgbValue, opacity: this.opacity });
        }
    }

    setPrimaryColor(index: number): void {
        this.colorService.updateMainColor(this.colorService.previousColors[index]);
        this.closeColorPicker();
        this.updateText();
    }

    setSecondaryColor(index: number): void {
        this.colorService.updateSecondaryColor(this.colorService.previousColors[index]);
        this.closeColorPicker();
    }

    closeColorPicker(): void {
        if (this.openColorPicker) {
            this.openColorPicker = false;
        }
    }

    updateOpacity(event: MatSliderChange): void {
        this.opacity = (event.value as number) / this.OPACITY_AJUSTMENT;
    }

    getRGB(rgbIndex: number): string {
        this.rgbArray = this.rgbValue
            .substring(this.CONCATENATE_OFFSET, this.rgbValue.length - 1)
            .replace(/ /, '')
            .split(',');

        return Number(this.rgbArray[rgbIndex]).toString(16);
    }

    applyRGBInput(input: string, rgbIndex: number): void {
        const convertedHexToNumber: number = parseInt(input, 16);
        if (this.inputHasErrors(input)) {
            this.rgbInputs[rgbIndex].inputError = true;
            return;
        }
        this.rgbArray[rgbIndex] = '' + convertedHexToNumber;
        this.rgbValue = `rgb(${this.rgbArray})`;
        if (this.rgbInputs[rgbIndex].inputError) {
            this.rgbInputs[rgbIndex].inputError = false;
        }
    }

    private inputHasErrors(input: string): boolean {
        if (input === '') {
            return true;
        }
        for (const char of input) {
            if (Number.isNaN(parseInt(char, 16))) {
                return true;
            }
        }
        return false;
    }

    updateText(): void {
        if (!(this.toolsService.currentTool instanceof TextService)) return;
        if (this.toolsService.textService.isWriting) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.toolsService.textService.registerTextCommand(this.drawingService.previewCtx, this.toolsService.textService.writtenOnPreview);
            this.toolsService.textService.drawBox();
        }
    }
}
