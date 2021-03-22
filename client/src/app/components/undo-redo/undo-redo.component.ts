import { Component, OnInit } from '@angular/core';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
    selector: 'app-undo-redo',
    templateUrl: './undo-redo.component.html',
    styleUrls: ['./undo-redo.component.scss'],
})
export class UndoRedoComponent implements OnInit {
    commandListIsEmpty: boolean = true;
    redoListIsEmpty: boolean = true;

    constructor(public undoRedoService: UndoRedoService) {
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
}
