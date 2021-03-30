import { Injectable } from '@angular/core';
import { ToolsService } from '@app/services/tools/tools.service';

@Injectable({
    providedIn: 'root',
})
export class ClipboardSelectionService {
    constructor(private toolsService: ToolsService) {}

    copy(): void {
        console.log('Copy works');
    }

    paste(): void {
        console.log('Paste Works');
    }

    cut(): void {
        console.log('Cut works');
    }

    delete(): void {
        console.log('delete works');
    }
}
