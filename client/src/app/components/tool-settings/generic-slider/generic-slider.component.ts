import { Component, Input, ViewChild } from '@angular/core';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { SliderSetting } from '@app/classes/slider-setting';
@Component({
    selector: 'app-generic-slider',
    templateUrl: './generic-slider.component.html',
    styleUrls: ['./generic-slider.component.scss'],
})
export class GenericSliderComponent {
    @Input() sliderSetting: SliderSetting;
    @ViewChild('matSlider', { static: false }) matSlider: MatSlider;

    updateSetting(event: MatSliderChange): void {
        this.sliderSetting.action(event.value as number);
        this.matSlider.blur();
    }
}
