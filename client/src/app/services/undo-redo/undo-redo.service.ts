import { Injectable } from '@angular/core';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { DrawingService } from '@app/services/drawing/drawing.service';
@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    commandList: AbstractCommand[];
    undoneList: AbstractCommand[];

    constructor(private drawingService: DrawingService) {
        this.commandList = [];
        this.undoneList = [];
    }

    addCommand(command: AbstractCommand): void {
        this.undoneList = [];
        this.commandList.push(command);
    }

    undo(): void {
        if (this.commandList.length <= 1) return;

        const undoAction = this.commandList.pop();
        if (undoAction != undefined) {
            this.undoneList.push(undoAction);
        }
        this.executeAllCommands();
    }

    redo(): void {
        if (this.undoneList.length !== 0) {
            const redoAction = this.undoneList.pop();
            if (redoAction != undefined) {
                this.commandList.push(redoAction);
                this.executeAllCommands();
            }
        }
    }

    executeAllCommands(): void {
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        for (const command of this.commandList) {
            command.execute();
        }
    }
}
