import { Component, OnInit } from '@angular/core';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-undo-redo',
    templateUrl: './undo-redo.component.html',
    styleUrls: ['./undo-redo.component.scss'],
})
export class UndoRedoComponent implements OnInit {
    constructor(public undoRedoService: UndoRedoService) {
        this.listenToUndoRedoNotification();
    }
    subscription: Subscription;
    commandListIsEmpty: boolean = true;
    redoListIsEmpty: boolean = true;

    ngOnInit(): void {
        this.commandListIsEmpty = true;
        this.redoListIsEmpty = true;
    }

    listenToUndoRedoNotification(): void {
        this.subscription = this.undoRedoService.newUndoRedoSignals().subscribe(() => {
            this.updateUndoRedoValues();
        });
    }

    updateUndoRedoValues(): void {
        this.commandListIsEmpty = this.undoRedoService.commandListIsEmpty();
        this.redoListIsEmpty = this.undoRedoService.redoListIsEmpty();
    }
}
