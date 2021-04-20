import { Component } from '@angular/core';
import { MagnetSelectionService } from '@app/services/tools/selection/magnet/magnet-selection.service';

interface Point {
    iconFamily: string;
    selectionTipContent: string;
    position: number;
}

@Component({
    selector: 'app-point-selector',
    templateUrl: './point-selector.component.html',
    styleUrls: ['./point-selector.component.scss'],
})
export class PointSelectorComponent {
    constructor(public magnetSelectionService: MagnetSelectionService) {}

    points: Point[] = [
        {
            iconFamily: 'far',
            selectionTipContent: 'Coin supérieur gauche',
            position: 0,
        },
        {
            iconFamily: 'far',
            selectionTipContent: 'Coin supérieur milieu',
            position: 1,
        },
        {
            iconFamily: 'fas',
            selectionTipContent: 'Coin supérieur droit',
            position: 2,
        },
        {
            iconFamily: 'fas',
            selectionTipContent: 'Coin milieu gauche',
            position: 3,
        },
        {
            iconFamily: 'fas',
            selectionTipContent: 'Coin milieu centre',
            position: 4,
        },
        {
            iconFamily: 'fas',
            selectionTipContent: 'Coin milieu droit',
            position: 5,
        },
        {
            iconFamily: 'fas',
            selectionTipContent: 'Coin inférieure gauche',
            position: 6,
        },
        {
            iconFamily: 'fas',
            selectionTipContent: 'Coin inférieure milieu',
            position: 7,
        },
        {
            iconFamily: 'fas',
            selectionTipContent: 'Coin inférieure droit',
            position: 8,
        },
    ];

    toggleActivePoint(point: number): void {
        this.magnetSelectionService.pointToMagnetize = point;
    }
}
