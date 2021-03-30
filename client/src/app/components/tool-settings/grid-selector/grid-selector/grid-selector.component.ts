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
                min: this.tool.MIN_SQUARE_SIZE,
                max: this.tool.MAX_SQUARE_SIZE,
                getAttribute: () => {
                    return this.tool.squareSize;
                },
                action: (value: number) => {
                    this.tool.squareSize = value;
                },
            },

            {
                title: 'Opacité',
                unit: '%',
                min: this.tool.MIN_OPACITY_PERCENTAGE,
                max: this.tool.MAX_OPACITY_PERCENTAGE,
                getAttribute: () => {
                    return this.tool.opacity;
                },
                action: (value: number) => {
                    this.tool.opacity = value;
                },
            },
        ];
    }
}
