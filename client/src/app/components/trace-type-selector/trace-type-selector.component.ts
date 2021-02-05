import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tool } from '@app/classes/tool';
@Component({
    selector: 'app-trace-type-selector',
    templateUrl: './trace-type-selector.component.html',
    styleUrls: ['./trace-type-selector.component.scss'],
})
export class TraceTypeSelectorComponent {
    @Output() updateTraceTypeEmitter: EventEmitter<number> = new EventEmitter<number>();
    @Input() tool: Tool; // could be a any subtype of shape to be drawn

    setActiveTraceType(type: number): void {
        this.updateTraceTypeEmitter.emit(type);
    }
}
