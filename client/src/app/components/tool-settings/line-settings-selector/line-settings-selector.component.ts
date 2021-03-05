import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSliderChange } from '@angular/material/slider';
import { LineService } from '@app/services/tools/line/line.service';

@Component({
    selector: 'app-line-settings-selector',
    templateUrl: './line-settings-selector.component.html',
    styleUrls: ['./line-settings-selector.component.scss'],
})
export class LineSettingsSelectorComponent {
    @Output() junction: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() junctionDiameter: EventEmitter<number> = new EventEmitter<number>();
    @Input() tool: LineService;

    updateDiameter(event: MatSliderChange): void {
        this.junctionDiameter.emit(event.value as number);
    }

    updateJunction(junction: MatSlideToggleChange): void {
        this.junction.emit(junction.checked);
    }
}
