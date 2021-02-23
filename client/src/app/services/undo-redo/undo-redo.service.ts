import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    actionList = [];
    redoList = [];
    constructor(private drawingService: DrawingService) {}

    //Une action devrait contenir son type (si c'est drawing, resizing ou selecting)

    // Two stacks

    // Action stack, where the actions are stacked

    // Redo stack, where we can store the redo actions. To be deleted when there's a new action coming in.

    // Different type of actions: resize container actions and tool actions, select action

    // To store resize contianer actions all that's needed is the drawing service. ( width the boxsize )

    // To store tools actions: TBD

    // To store select actions: TBD ( et aussi pour resize la selection ) ( et storer quand on deplace la selection )
}

/*
  Random 
    resize : .push('resize', boxSize){
      
    }
  }
*/
