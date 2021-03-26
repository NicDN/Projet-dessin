import { Component } from '@angular/core';
import { EllipseSelectionService } from '@app/services/tools/selection/ellipse/ellipse-selection.service';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle/rectangle-selection.service';
import { ToolsService } from '@app/services/tools/tools.service';

@Component({
    selector: 'app-selection-options',
    templateUrl: './selection-options.component.html',
    styleUrls: ['./selection-options.component.scss'],
})
export class SelectionOptionsComponent {
    constructor(
        private rectangleSelectionService: RectangleSelectionService,
        private ellipseSelectionService: EllipseSelectionService,
        private toolsService: ToolsService,
    ) {}

    selectionIsActive(): boolean {
        if (this.rectangleSelectionService.selectionExists || this.ellipseSelectionService.selectionExists) {
            return true;
        }
        return false;
    }

    selectAll(): void {
        this.toolsService.setCurrentTool(this.toolsService.rectangleSelectionService);
        this.rectangleSelectionService.selectAll();
    }
}
