import { Component, OnInit } from '@angular/core';
import { ToolsService } from '@app/services/tools/tools.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-drawing-options',
    templateUrl: './drawing-options.component.html',
    styleUrls: ['./drawing-options.component.scss'],
})
export class DrawingOptionsComponent implements OnInit {
    commandListIsEmpty: boolean = true;
    redoListIsEmpty: boolean = true;

    constructor(public undoRedoService: UndoRedoService, public toolService: ToolsService) {
        this.listenToUndoRedoNotification();
    }

    ngOnInit(): void {
        this.commandListIsEmpty = true;
        this.redoListIsEmpty = true;
    }

    private listenToUndoRedoNotification(): void {
        this.undoRedoService.newUndoRedoSignals().subscribe(() => {
            this.updateUndoRedoValues();
        });
    }

    private updateUndoRedoValues(): void {
        this.commandListIsEmpty = this.undoRedoService.commandListIsEmpty();
        this.redoListIsEmpty = this.undoRedoService.redoListIsEmpty();
    }

    handleClickGrid(): void {
        this.toolService.setCurrentTool(this.toolService.gridService);
        this.toolService.gridService.handleDrawGrid();
    }
}
