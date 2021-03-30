import { Component, OnInit } from '@angular/core';
import { SliderSetting } from '@app/classes/slider-setting';
import { StampService } from '@app/services/tools/stamp/stamp.service';

@Component({
    selector: 'app-stamp-selector',
    templateUrl: './stamp-selector.component.html',
    styleUrls: ['./stamp-selector.component.scss'],
})
export class StampSelectorComponent implements OnInit {
    constructor(private stampService: StampService) {}

    scalingSetting: SliderSetting;
    angleSetting: SliderSetting;

    ngOnInit(): void {
        this.scalingSetting = {
            title: "Facteur de mise à l'échelle",
            unit: '',
            min: 1,
            max: this.stampService.SCALING_MAX_VALUE,

            getAttribute: () => {
                return this.stampService.scaling;
            },
            action: (value: number) => (this.stampService.scaling = value),
        };

        this.angleSetting = {
            title: "Angle d'orientation",
            unit: 'Degrés',
            min: this.stampService.ANGLE_MIN_VALUE,
            max: this.stampService.ANGLE_MAX_VALUE,

            getAttribute: () => {
                return this.stampService.angle;
            },
            action: (value: number) => (this.stampService.angle = value),
        };
    }

    openStampLibrary(): void {
        return;
    }
}
