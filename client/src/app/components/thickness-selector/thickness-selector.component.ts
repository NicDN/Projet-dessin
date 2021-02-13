import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { DrawingTool } from '@app/classes/drawing-tool';

@Component({
    selector: 'app-thickness-selector',
    templateUrl: './thickness-selector.component.html',
    styleUrls: ['./thickness-selector.component.scss'],
})
export class ThicknessSelectorComponent {
    @Output() thickness: EventEmitter<number> = new EventEmitter<number>();
    @Input() tool: DrawingTool;

    updateThickness(event: MatSliderChange): void {
        this.thickness.emit(event.value as number);
    }
}
