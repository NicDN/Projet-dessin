import { Component, OnInit } from '@angular/core';
import { SliderSetting } from '@app/classes/slider-setting';
import { StampService } from '@app/services/tools/stamp/stamp.service';

@Component({
    selector: 'app-stamp-selector',
    templateUrl: './stamp-selector.component.html',
    styleUrls: ['./stamp-selector.component.scss'],
})
export class StampSelectorComponent implements OnInit {
    scalingSetting: SliderSetting;
    angleSetting: SliderSetting;

    private readonly PERCENTAGE_FACTOR: number = 180;
    private readonly FULL_CIRCLE_DEGREES: number = 360;

    constructor(public stampService: StampService) {}

    ngOnInit(): void {
        this.scalingSetting = {
            title: "Facteur de mise à l'échelle",
            unit: '%',
            min: this.stampService.SCALING_MIN_VALUE,
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
            max: this.FULL_CIRCLE_DEGREES - 1,

            getAttribute: () => {
                return Math.ceil(Math.abs((this.stampService.angle * this.PERCENTAGE_FACTOR) / Math.PI)) % this.FULL_CIRCLE_DEGREES;
            },
            action: (value: number) => (this.stampService.angle = (value * Math.PI) / this.PERCENTAGE_FACTOR),
        };

        this.stampService.selectedStampSrc = this.stampService.selectedStampSrc;
    }
}
