import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Shape } from '@app/classes/shape';

@Component({
    selector: 'app-polygon-sides-selector',
    templateUrl: './polygon-sides-selector.component.html',
    styleUrls: ['./polygon-sides-selector.component.scss'],
})
export class PolygonSidesSelectorComponent {
    @Output() numberOfSides: EventEmitter<number> = new EventEmitter<number>();
    @Input() polygon: Shape;

    updateNumberOfSides(event: MatSliderChange): void {
        this.numberOfSides.emit(event.value as number);
    }
}
