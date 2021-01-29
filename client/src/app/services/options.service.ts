import { Injectable } from '@angular/core';
import { Option } from '@app/classes/option';
import { Tool } from '@app/classes/tool';
import { ToolsService } from '@app/services/tools/tools.service';

@Injectable({
    providedIn: 'root',
})
export class OptionsService {
    public currentOption: Option;
    constructor(private toolService: ToolsService) {
        this.currentOption=this.toolService.currentTool;
    }

    setActiveOption(option: Option): void {
        if (option instanceof Tool) {
            this.toolService.setCurrentTool(option as Tool);
        }
        this.currentOption = option;
    }
}
