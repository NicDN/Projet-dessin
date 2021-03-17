import { Component, Input } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { SliderSetting } from '@app/classes/slider-setting';
@Component({
    selector: 'app-generic-slider',
    templateUrl: './generic-slider.component.html',
    styleUrls: ['./generic-slider.component.scss'],
})
export class GenericSliderComponent {
    @Input() sliderSetting: SliderSetting;

    updateSetting(event: MatSliderChange): void {
        this.sliderSetting.action(event.value as number);
    }
}
