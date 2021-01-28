import { Injectable } from '@angular/core';
import { Option } from '@app/classes/option';
import { Tool } from '@app/classes/tool';
import { ToolsService } from '@app/services/tools/tools.service';

@Injectable({
    providedIn: 'root',
})
export class OptionsService {
    constructor(private toolService: ToolsService) {}

    setActiveOption(option: Option): void {
        if (option instanceof Tool) {
            this.toolService.setCurrentTool(option as Tool);
        }
    }
}
