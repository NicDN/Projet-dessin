import { Injectable } from '@angular/core';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { DrawingService } from '@app/services/drawing/drawing.service';
// import { ResizeCommand } from '@app/classes/commands/resize-command';
// import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    // To be changed to Action later on
    commandList: AbstractCommand[];
    undoneList: AbstractCommand[];

    constructor(private drawingService: DrawingService) {
        // TBD gud: )
        this.commandList = [];
        this.undoneList = [];
    }

    // Will be generic: it is now : )
    addCommand(command: AbstractCommand): void {
        this.undoneList = []; // New action means we can't redo
        this.commandList.push(command);
    }

    // undo or redo should just add or remove from stack
    // will have to deal if its empty or cases like that
    undo(): void {
        if (this.commandList.length <= 1) return;

        const undoAction = this.commandList.pop();
        if (undoAction != undefined) {
            this?.undoneList?.push(undoAction);
        }
        this.executeAllCommands();
    }

    redo(): void {
        console.log(this.undoneList.length);
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
