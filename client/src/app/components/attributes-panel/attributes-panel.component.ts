import { Component, OnInit } from '@angular/core';
import { DrawingTool } from '@app/classes/drawing-tool';
import { SelectionTool } from '@app/classes/selection-tool';
import { Shape } from '@app/classes/shape';
import { SliderSetting } from '@app/classes/slider-setting';
import { Tool } from '@app/classes/tool';
import { FillDripService } from '@app/services/tools/fill-drip/fill-drip.service';
import { MoveSelectionService } from '@app/services/tools/selection/move-selection.service';
import { PolygonService } from '@app/services/tools/shape/polygon/polygon.service';
import { SprayCanService } from '@app/services/tools/spray-can/spray-can.service';
import { TextService } from '@app/services/tools/text/textService/text.service';
import { ToolsService } from '@app/services/tools/tools.service';

@Component({
    selector: 'app-attributes-panel',
    templateUrl: './attributes-panel.component.html',
    styleUrls: ['./attributes-panel.component.scss'],
})
export class AttributesPanelComponent implements OnInit {
    currentTool: Tool;
    private readonly PERCENTAGE: number = 100;
    thicknessSetting: SliderSetting;
    polygonSetting: SliderSetting;
    fillDripSetting: SliderSetting;

    constructor(public toolsService: ToolsService, private polygonService: PolygonService, public moveSelectionService: MoveSelectionService) {
        this.subscribe();
    }

    ngOnInit(): void {
        this.initializeSettings();
    }

    private initializeSettings(): void {
        this.thicknessSetting = {
            title: 'Épaisseur du trait',
            unit: 'pixels',
            min: 1,
            max: 50,
            getAttribute: () => {
                return (this.currentTool as DrawingTool).thickness;
            },
            action: (value: number) => {
                (this.currentTool as DrawingTool).thickness = value;
            },
        };

        this.polygonSetting = {
            title: 'Nombre de côtés',
            unit: 'côtés',
            min: this.polygonService.MIN_SIDES,
            max: this.polygonService.MAX_SIDES,
            getAttribute: () => {
                return (this.currentTool as PolygonService).numberOfSides;
            },
            action: (value: number) => {
                (this.currentTool as PolygonService).numberOfSides = value;
            },
        };

        this.fillDripSetting = {
            title: "Tolérance d'écart",
            unit: '%',
            min: 0,
            max: 100,
            getAttribute: () => {
                return Math.round((this.currentTool as FillDripService).acceptancePercentage * this.PERCENTAGE);
            },
            action: (value: number) => {
                (this.currentTool as FillDripService).acceptancePercentage = value / this.PERCENTAGE;
            },
        };
    }

    private subscribe(): void {
        this.toolsService.getCurrentTool().subscribe((currentTool: Tool) => (this.currentTool = currentTool));
    }

    shapeIsActive(): boolean {
        return this.currentTool instanceof Shape;
    }

    polygonIsActive(): boolean {
        return this.currentTool instanceof PolygonService;
    }

    selectionToolIsActive(): boolean {
        return this.currentTool instanceof SelectionTool;
    }

    needsTraceThickness(): boolean {
        if (this.currentTool instanceof SprayCanService || this.currentTool instanceof FillDripService || this.currentTool instanceof TextService) {
            return false;
        }
        return this.currentTool instanceof DrawingTool;
    }
}
