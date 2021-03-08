import { Component } from '@angular/core';
import { DrawingTool } from '@app/classes/drawing-tool';
import { Shape, TraceType } from '@app/classes/shape';
import { Tool } from '@app/classes/tool';
import { LineService } from '@app/services/tools/line/line.service';
import { PolygonService } from '@app/services/tools/shape/polygon/polygon.service';
import { SprayCanService } from '@app/services/tools/spray-can/spray-can.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-attributes-panel',
    templateUrl: './attributes-panel.component.html',
    styleUrls: ['./attributes-panel.component.scss'],
})
export class AttributesPanelComponent {
    subscription: Subscription;
    currentTool: Tool;

    constructor(public toolsService: ToolsService) {
        this.subscribe();
    }

    subscribe(): void {
        this.subscription = this.toolsService.getCurrentTool().subscribe((currentTool: Tool) => (this.currentTool = currentTool));
    }

    setThickness(thickness: number): void {
        (this.currentTool as DrawingTool).thickness = thickness;
    }

    setNumberOfSides(numberOfSides: number): void {
        (this.currentTool as PolygonService).numberOfSides = numberOfSides;
    }

    setTraceType(type: TraceType): void {
        (this.currentTool as Shape).traceType = type;
    }

    setLineJunctionDiameter(junctionDiameter: number): void {
        (this.currentTool as LineService).junctionDiameter = junctionDiameter;
    }

    setJunctionChecked(junction: boolean): void {
        (this.currentTool as LineService).drawWithJunction = junction;
    }

    shapeIsActive(): boolean {
        return this.currentTool instanceof Shape;
    }

    polygonIsActive(): boolean {
        return this.currentTool instanceof PolygonService;
    }

    needsTraceThickness(): boolean {
        if (this.currentTool instanceof SprayCanService) {
            return false;
        }
        return this.currentTool instanceof DrawingTool;
    }
}
