import { Component, Input, OnInit } from '@angular/core';
import { SliderSetting } from '@app/classes/slider-setting';
import { SprayCanService } from '@app/services/tools/spray-can/spray-can.service';

@Component({
    selector: 'app-spray-can-settings-selector',
    templateUrl: './spray-can-settings-selector.component.html',
    styleUrls: ['./spray-can-settings-selector.component.scss'],
})
export class SprayCanSettingsSelectorComponent implements OnInit {
    @Input() tool: SprayCanService;

    sprayCanSettings: SliderSetting[];

    ngOnInit(): void {
        this.sprayCanSettings = [
            {
                title: "Nombre d'émissions par secondes",
                unit: '',
                min: this.tool.MIN_EMISSION_RATE,
                max: this.tool.MAX_EMISSION_RATE,
                getAttribute: () => {
                    return this.tool.emissionRate;
                },
                action: (value: number) => {
                    this.tool.emissionRate = value;
                },
            },
            {
                title: 'Diamètre du jet',
                unit: 'pixels',
                min: this.tool.MIN_SPRAY_DIAMETER,
                max: this.tool.MAX_SPRAY_DIAMETER,
                getAttribute: () => {
                    return this.tool.sprayDiameter;
                },
                action: (value: number) => {
                    this.tool.sprayDiameter = value;
                },
            },
            {
                title: 'Diamètre des goutelettes',
                unit: 'pixels',
                min: this.tool.MIN_DROPLETS_DIAMETER,
                max: this.tool.MAX_DROPLETS_DIAMETER,
                getAttribute: () => {
                    return this.tool.dropletsDiameter;
                },
                action: (value: number) => {
                    this.tool.dropletsDiameter = value;
                },
            },
        ];
    }
}
