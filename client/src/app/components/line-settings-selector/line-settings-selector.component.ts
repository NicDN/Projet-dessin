import { Component, Input, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Output, EventEmitter } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Tool } from '@app/classes/tool';
import { LineService } from '@app/services/tools/drawing-tool/line/line.service';
//  import { LineService } from '@app/services/tools/drawing-tool/line/line.service';

@Component({
    selector: 'app-line-settings-selector',
    templateUrl: './line-settings-selector.component.html',
    styleUrls: ['./line-settings-selector.component.scss'],
})
export class LineSettingsSelectorComponent implements OnInit {
    @Output() updatedotJunctionCheckedEmitter = new EventEmitter<boolean>();
    @Output() updateJunctionDiameterEmitter = new EventEmitter<number>();
    @Input() tool: Tool;

    dotJunctionChecked: boolean;
    junctionDiameter: number;

    ngOnInit(): void {
        this.dotJunctionChecked = (this.tool as LineService).drawWithJunction;
        this.junctionDiameter = (this.tool as LineService).junctionDiameter;
    }

    onChange(changedValue: MatSlideToggleChange) {
        this.dotJunctionChecked = changedValue.checked;
        this.updatedotJunctionCheckedEmitter.emit(changedValue.checked);
    }

    updateDiameter(event: MatSliderChange) {
        this.updateJunctionDiameterEmitter.emit(event.value as number);
        this.junctionDiameter = event.value as number;
    }
}
