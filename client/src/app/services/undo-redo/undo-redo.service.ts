import { Injectable } from '@angular/core';
import { BoxSize } from '@app/classes/box-size';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
// import { ResizeCommand } from '@app/classes/commands/resize-command';
import { Observable, Subject } from 'rxjs';
import { DrawingService } from '@app/services/drawing/drawing.service';
// import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    // To be changed to Action later on
    commandList: AbstractCommand[];
    undoneList: AbstractCommand[];

    private subject: Subject<BoxSize> = new Subject<BoxSize>();

    constructor(private drawingService: DrawingService) {
        // TBD
        this.commandList = [];
        this.undoneList = [];
    }

    sendNotifResize(boxSize: BoxSize): void {
        this.subject.next(boxSize);
    }

    newIncomingUndoRedoResizeSignals(): Observable<BoxSize> {
        return this.subject.asObservable();
    }

    // Will be generic: it is now : )
    addCommand(command: AbstractCommand): void {
        // this.undoneList = []; // New action means we can't redo
        this.commandList.push(command);
        console.log(this.commandList);
    }

    // undo or redo should just add or remove from stack
    // will have to deal if its empty or cases like that
    undo(): void {
        console.log(this.commandList);
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
            }
            this.executeAllCommands();
        }
    }

    executeAllCommands(): void {
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        for (let i = this.commandList.length; i > 0; i--) {
            this.commandList[i]?.execute();
        }
    }
}
