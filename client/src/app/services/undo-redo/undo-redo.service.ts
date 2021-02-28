import { Injectable } from '@angular/core';
import { BoxSize } from '@app/classes/box-size';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
// import { ResizeCommand } from '@app/classes/commands/resize-command';
import { Observable, Subject } from 'rxjs';
// import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    // To be changed to Action later on
    commandList: AbstractCommand[];
    undoneList: AbstractCommand[];

    private subject: Subject<BoxSize> = new Subject<BoxSize>();

    constructor(/*private drawingService: DrawingService*/) {
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
        this.undoneList = []; // New action means we can't redo
        this.commandList.push(command);
    }

    undo(): void {
        this.sendToRedoStack();
        for (let i = this.commandList.length; i > 0; i--) {
            this.commandList[i]?.execute();
        }
    }

    sendToRedoStack(): void {
        const undoAction = this.commandList.pop();
        if (undoAction != undefined) {
            this.undoneList.push(undoAction);
        }
    }
}
