import { Component, OnInit } from '@angular/core';
import { DrawingTool } from '@app/classes/drawing-tool';
import { Shape } from '@app/classes/shape';
import { Tool } from '@app/classes/tool';
import { LineService } from '@app/services/tools/drawing-tool/line/line.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-attributes-panel',
    templateUrl: './attributes-panel.component.html',
    styleUrls: ['./attributes-panel.component.scss'],
})
export class AttributesPanelComponent implements OnInit {
    subscription: Subscription;
    currentTool: Tool;
    thickness: number;
    trace: number;

    constructor(private toolsService: ToolsService) {
        this.subscription = this.toolsService.getCurrentTool().subscribe((currentTool: Tool) => (this.currentTool = currentTool));
    }
    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }

    setThickness(thickness: number): void {
        (this.currentTool as DrawingTool).thickness = thickness;
    }

    setTraceType(type: number): void {
        if (this.currentTool instanceof Shape) {
            this.currentTool.setTraceType(type);
        }
    }

    setLineJunctionDiameter(junctionDiameter: number): void {
        if (this.currentTool instanceof LineService) {
            this.currentTool.junctionDiameter = junctionDiameter;
        }
    }

    setJunctionChecked(checked: boolean): void {
        if (this.currentTool instanceof LineService) {
            this.currentTool.drawWithJunction = checked;
        }
    }

    pencilOrEraserIsActive(): boolean {
        return this.currentTool === this.toolsService.pencilService || this.currentTool === this.toolsService.eraserService;
    }

    shapeIsActive(): boolean {
        return this.currentTool instanceof Shape;
    }

    lineIsActive(): boolean {
        return this.currentTool === this.toolsService.lineService;
    }
}
