import { Component, Input } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSliderChange } from '@angular/material/slider';
import { LineService } from '@app/services/tools/line/line.service';

@Component({
    selector: 'app-line-settings-selector',
    templateUrl: './line-settings-selector.component.html',
    styleUrls: ['./line-settings-selector.component.scss'],
})
export class LineSettingsSelectorComponent {
    @Input() tool: LineService;

    updateDiameter(event: MatSliderChange): void {
        this.tool.junctionDiameter = event.value as number;
    }

    updateJunction(junction: MatSlideToggleChange): void {
        this.tool.drawWithJunction = junction.checked;
    }
}
