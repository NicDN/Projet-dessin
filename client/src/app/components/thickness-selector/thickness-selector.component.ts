import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { DrawingTool } from '@app/classes/drawing-tool';
// import { EraserService } from '@app/services/tools/eraser/eraser.service';

@Component({
    selector: 'app-thickness-selector',
    templateUrl: './thickness-selector.component.html',
    styleUrls: ['./thickness-selector.component.scss'],
})
export class ThicknessSelectorComponent {
    @Output() updateThicknessEmitter: EventEmitter<number> = new EventEmitter<number>();
    @Input() tool: DrawingTool;

    updateThickness(event: MatSliderChange): void {
        this.updateThicknessEmitter.emit(event.value as number);
    }
}
