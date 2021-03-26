import { Component, Input, OnInit } from '@angular/core';
import { SliderSetting } from '@app/classes/slider-setting';
import { GridService } from '@app/services/grid/grid.service';

@Component({
    selector: 'app-grid-selector',
    templateUrl: './grid-selector.component.html',
    styleUrls: ['./grid-selector.component.scss'],
})
export class GridSelectorComponent implements OnInit {
    @Input() tool: GridService;

    gridSettings: SliderSetting[];
    ngOnInit(): void {
        this.gridSettings = [
            {
                title: 'Taille des carrées',
                unit: 'Pixels',
                min: 1, // TODO: must be constants defined in grid service
                max: 20, // TODO: must be constants defined in grid service
                getAttribute: () => {
                    return 1; // dump value
                },
                // tslint:disable-next-line: no-empty
                action: (value: number) => {},
            },

            {
                title: 'Opacité',
                unit: '',
                min: 1, // TODO: must be constants defined in grid service
                max: 100, // TODO: must be constants defined in grid service
                getAttribute: () => {
                    return 1; // dump value
                },
                // tslint:disable-next-line: no-empty
                action: (value: number) => {
                    // divide value by 100 to have opacity between 0.1 - 1
                },
            },
        ];
    }
}
