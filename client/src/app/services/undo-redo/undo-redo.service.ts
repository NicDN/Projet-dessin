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

    // Will be generic
    addActionResize(command: AbstractCommand): void {
        this.undoneList = []; // New action means we can't redo
        this.commandList.push(command);
    }

    // To be generic and we'll check the id first
    undo(): void {
        // if (this.actionList.length !== 0) {
        const undoAction = this.commandList.pop();
        if (undoAction != undefined) {
            // this.undoneList.push(undoAction);
            // if (undoAction.id === 'resize') {
            //     this.sendNotifResize(undoAction?.oldBoxSize);
            // }
            undoAction.execute();
        }
        // } else {
        //     console.log('There are no actions !');
        // }
    }

    // SAME CODE AS UNDO, WILL FIX LATER !!!!!!!
    // fix solution : just add a boolean to see if its a resize or undo under the same function
    // redo(): void {
    //     if (this.redoList.length !== 0) {
    //         const redoAction = this.redoList.pop();
    //         if (redoAction != undefined) {
    //             this.actionList.push(redoAction);
    //             if (redoAction.id === 'resize') {
    //                 this.sendNotifResize(redoAction?.oldBoxSize);
    //             }
    //         }
    //     }
    // }
}

// Une action devrait contenir son type (si c'est drawing, resizing ou selecting)

// Two stacks

// Action stack, where the actions are stacked

// Redo stack, where we can store the redo actions. To be deleted when there's a new action coming in.

// Different type of actions: resize container actions and tool actions, select action

// To store resize contianer actions all that's needed is the drawing service. ( width the boxsize )

// To store tools actions: TBD

// To store select actions: TBD ( et aussi pour resize la selection ) ( et storer quand on deplace la selection )

/*
  Random 
    resize : .push('resize', oldBoxSize);

    undo: 
      if(is resize){
        action.drawingService.onSizeChange()
      }
  }
*/
