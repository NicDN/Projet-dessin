import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Tool } from '@app/classes/tool';

@Component({
    selector: 'app-thickness-selector',
    templateUrl: './thickness-selector.component.html',
    styleUrls: ['./thickness-selector.component.scss'],
})
export class ThicknessSelectorComponent {
    @Output() updateThicknessEmitter: EventEmitter<number> = new EventEmitter<number>();
    @Input() tool: Tool;

    updateThickness(event: MatSliderChange): void {
        this.updateThicknessEmitter.emit(event.value as number);
    }
}
