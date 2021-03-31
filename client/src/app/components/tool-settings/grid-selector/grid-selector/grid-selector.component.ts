import { Component, Input, OnInit } from '@angular/core';
import { SliderSetting } from '@app/classes/slider-setting';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';

@Component({
    selector: 'app-grid-selector',
    templateUrl: './grid-selector.component.html',
    styleUrls: ['./grid-selector.component.scss'],
})
export class GridSelectorComponent implements OnInit {
    @Input() tool: GridService;

    gridSettings: SliderSetting[];

    constructor(private drawingService: DrawingService) {}

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
                    this.drawingService.updateGrid();
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
                    this.drawingService.updateGrid();
                },
            },
        ];
    }
}
