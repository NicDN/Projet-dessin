import { Injectable } from '@angular/core';
import { BoxSize } from '@app/classes/box-size';
import { ResizeAction } from '@app/classes/resize-action';
import { Observable, Subject } from 'rxjs';
// import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    // To be changed to Action later on
    actionList: ResizeAction[];
    redoList: ResizeAction[];

    private subject: Subject<BoxSize> = new Subject<BoxSize>();

    constructor(/*private drawingService: DrawingService*/) {
        // TBD
        this.actionList = [];
    }

    sendNotifResize(boxSize: BoxSize): void {
        this.subject.next(boxSize);
    }

    newIncomingUndoRedoResizeSignals(): Observable<BoxSize> {
        return this.subject.asObservable();
    }

    // Will be generic
    addActionResize(resizeAction: ResizeAction): void {
        this.redoList = []; // New action means we can't redo
        this.actionList.push(resizeAction);
    }

    // To be generic and we'll check the id first
    undo(): void {
        // if (this.actionList.length !== 0) {
        const undoAction = this.actionList.pop();
        if (undoAction != undefined) {
            this.redoList.push(undoAction);
            if (undoAction.id === 'resize') {
                this.sendNotifResize(undoAction?.oldBoxSize);
            }
        }
        // } else {
        //     console.log('There are no actions !');
        // }
    }

    // SAME CODE AS UNDO, WILL FIX LATER !!!!!!!
    // fix solution : just add a boolean to see if its a resize or undo under the same function
    redo(): void {
        if (this.redoList.length !== 0) {
            const redoAction = this.redoList.pop();
            if (redoAction != undefined) {
                this.actionList.push(redoAction);
                if (redoAction.id === 'resize') {
                    this.sendNotifResize(redoAction?.oldBoxSize);
                }
            }
        }
    }
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
