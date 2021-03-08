import { Component, Input } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { SprayCanService } from '@app/services/tools/spray-can/spray-can.service';

@Component({
    selector: 'app-spray-can-settings-selector',
    templateUrl: './spray-can-settings-selector.component.html',
    styleUrls: ['./spray-can-settings-selector.component.scss'],
})
export class SprayCanSettingsSelectorComponent {
    @Input() tool: SprayCanService;

    updateEmissionRate(event: MatSliderChange): void {
        this.tool.emissionRate = event.value as number;
    }

    updateSprayDiameter(event: MatSliderChange): void {
        this.tool.sprayDiameter = event.value as number;
    }

    updateDropletsDiameter(event: MatSliderChange): void {
        this.tool.dropletsDiameter = event.value as number;
    }
}
