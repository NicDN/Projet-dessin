import { Component, OnInit } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Subscription } from 'rxjs';
import { ToolsService } from '@app/services/tools/tools.service';
import { PencilService } from '@app/services/tools/drawing-tool/pencil/pencil-service';

@Component({
    selector: 'app-attributes-panel',
    templateUrl: './attributes-panel.component.html',
    styleUrls: ['./attributes-panel.component.scss'],
})
export class AttributesPanelComponent implements OnInit {
    subscription: Subscription;
    currentTool: Tool;

    constructor(private toolsService: ToolsService, pencilService: PencilService) {
        this.subscription = this.toolsService.getCurrentTool().subscribe((currentTool: Tool) => (this.currentTool = currentTool));
    }

    ngOnInit(): void {}

   
}
