import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Shape, TraceType } from '@app/classes/shape';
@Component({
    selector: 'app-trace-type-selector',
    templateUrl: './trace-type-selector.component.html',
    styleUrls: ['./trace-type-selector.component.scss'],
})
export class TraceTypeSelectorComponent {
    @Output() traceType: EventEmitter<number> = new EventEmitter<number>();
    @Input() tool: Shape;

    traceTypeOptions: { iconFamily: string; icon: string; toolTipContent: string; traceType: TraceType }[] = [
        { iconFamily: 'far', icon: 'square', toolTipContent: 'Contour', traceType: TraceType.Bordered },
        { iconFamily: 'fas', icon: 'square', toolTipContent: 'Plein', traceType: TraceType.FilledNoBordered },
        { iconFamily: 'fas', icon: 'battery-full', toolTipContent: 'Plein avec contour', traceType: TraceType.FilledAndBordered },
    ];

    setActiveTraceType(traceType: TraceType): void {
        this.traceType.emit(traceType);
    }
}
