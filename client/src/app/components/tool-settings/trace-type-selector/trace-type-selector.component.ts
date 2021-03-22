import { Component, Input } from '@angular/core';
import { Shape, TraceType } from '@app/classes/shape';
import { ColorService } from '@app/services/color/color.service';

interface TraceTypeOption {
    iconFamily: string;
    icon: string;
    toolTipContent: string;
    traceType: TraceType;
}
@Component({
    selector: 'app-trace-type-selector',
    templateUrl: './trace-type-selector.component.html',
    styleUrls: ['./trace-type-selector.component.scss'],
})
export class TraceTypeSelectorComponent {
    @Input() tool: Shape;

    constructor(public colorService: ColorService) {}

    traceTypeOptions: TraceTypeOption[] = [
        { iconFamily: 'far', icon: 'square', toolTipContent: 'Contour', traceType: TraceType.Bordered },
        {
            iconFamily: 'fas',
            icon: 'square',
            toolTipContent: 'Plein',
            traceType: TraceType.FilledNoBordered,
        },
        { iconFamily: 'fas', icon: 'battery-full', toolTipContent: 'Plein avec contour', traceType: TraceType.FilledAndBordered },
    ];

    setActiveTraceType(traceType: TraceType): void {
        this.tool.traceType = traceType;
    }

    getColor(toolTipContent: string): string {
        if (toolTipContent === 'Contour') {
            return this.colorService.secondaryColor.rgbValue;
        } else if (toolTipContent === 'Plein') {
            return this.colorService.mainColor.rgbValue;
        }
        return 'white';
    }
}
