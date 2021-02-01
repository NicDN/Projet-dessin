import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Tool } from '@app/classes/tool';

@Component({
    selector: 'app-thickness-selector',
    templateUrl: './thickness-selector.component.html',
    styleUrls: ['./thickness-selector.component.scss'],
})
export class ThicknessSelectorComponent implements OnInit {
    @Output() updateThicknessEmitter = new EventEmitter<number>();
    @Input() tool: Tool; 
    constructor() {}

    ngOnInit(): void {}

    updateThickness(event: MatSliderChange) {
        this.updateThicknessEmitter.emit(event.value as number);
    }
}
