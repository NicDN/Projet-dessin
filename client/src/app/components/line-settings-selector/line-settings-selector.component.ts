import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSliderChange } from '@angular/material/slider';
import { LineService } from '@app/services/tools/drawing-tool/line/line.service';

@Component({
    selector: 'app-line-settings-selector',
    templateUrl: './line-settings-selector.component.html',
    styleUrls: ['./line-settings-selector.component.scss'],
})
export class LineSettingsSelectorComponent {
    @Output() updatedotJunctionCheckedEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() updateJunctionDiameterEmitter: EventEmitter<number> = new EventEmitter<number>();
    @Input() tool: LineService;

    updateDiameter(event: MatSliderChange): void {
        this.updateJunctionDiameterEmitter.emit(event.value as number);
    }

    updateJunction(junction: MatSlideToggleChange): void {
        this.updatedotJunctionCheckedEmitter.emit(junction.checked);
    }
}
