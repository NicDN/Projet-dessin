import { Component, OnInit } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Subscription } from 'rxjs';
import { ToolsService } from '@app/services/tools/tools.service';
import { Shape } from '@app/classes/shape';
import { LineService } from '@app/services/tools/drawing-tool/line/line.service';

@Component({
    selector: 'app-attributes-panel',
    templateUrl: './attributes-panel.component.html',
    styleUrls: ['./attributes-panel.component.scss'],
})
export class AttributesPanelComponent implements OnInit {
    subscription: Subscription;
    currentTool: Tool;
    thickness: number;
    trace:number;

    constructor(private toolsService: ToolsService) {
        this.subscription = this.toolsService.getCurrentTool().subscribe((currentTool: Tool) => (this.currentTool = currentTool));
    }

    ngOnInit(): void {}
    
    setThickness(thickness: number) {
        this.currentTool.thickness = thickness;
    }

    setTraceType(type: number) {
        if (this.currentTool instanceof Shape) {
            this.currentTool.setTraceType(type);
        }
    }

    setLineJunctionDiameter(junctionDiameter: number) {
        if (this.currentTool instanceof LineService) {
            this.currentTool.junctionDiameter = junctionDiameter;
        }
    }

    setJunctionChecked(checked: boolean) {
        if (this.currentTool instanceof LineService) {
            this.currentTool.drawWithJunction = checked;
        }
    }

    // these methods should be refactored to be compact
    pencilOrEraserIsActive(): boolean {
        return this.currentTool == this.toolsService.pencilService || this.currentTool == this.toolsService.eraserService;
    }

    shapeIsActive():boolean{
        return this.currentTool instanceof Shape;
    }

    lineIsActive(): boolean {
        return this.currentTool == this.toolsService.lineService;
    }
}
