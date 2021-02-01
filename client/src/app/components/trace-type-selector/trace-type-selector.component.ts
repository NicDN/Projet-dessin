import { Component, Input, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { Tool } from '@app/classes/tool';
@Component({
    selector: 'app-trace-type-selector',
    templateUrl: './trace-type-selector.component.html',
    styleUrls: ['./trace-type-selector.component.scss'],
})
export class TraceTypeSelectorComponent implements OnInit {
    @Output() updateTraceTypeEmitter = new EventEmitter<number>();
    @Input() tool:Tool; // could be a any subtype of shape to be drawn
    constructor() {}

    ngOnInit(): void {}
    
    setActiveTraceType(type: number): void {
        this.updateTraceTypeEmitter.emit(type);
    }
}
