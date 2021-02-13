import { Component } from '@angular/core';
import { DrawingTool } from '@app/classes/drawing-tool';
import { Shape, TraceType } from '@app/classes/shape';
import { Tool } from '@app/classes/tool';
import { LineService } from '@app/services/tools/drawing-tool/line/line.service';
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

    drawingToolIsActive(): boolean {
        return this.currentTool instanceof DrawingTool;
    }
}
