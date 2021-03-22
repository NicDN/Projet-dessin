import { Injectable } from '@angular/core';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Observable, Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    private commandList: AbstractCommand[] = [];
    private undoneList: AbstractCommand[] = [];
    private canUndoRedo: boolean = true;

    private updateUndoRedoComponent: Subject<void> = new Subject<void>();

    constructor(private drawingService: DrawingService) {
        this.drawingService.newBaseLineSignals().subscribe((baseLineCommand) => {
            this.setBaseLine(baseLineCommand);
        });
    }

    private sendUndoRedoNotif(): void {
        this.updateUndoRedoComponent.next();
    }

    newUndoRedoSignals(): Observable<void> {
        return this.updateUndoRedoComponent.asObservable();
    }

    commandListIsEmpty(): boolean {
        return this.commandList.length === 1;
    }

    redoListIsEmpty(): boolean {
        return this.undoneList.length === 0;
    }

    disableUndoRedo(): void {
        this.canUndoRedo = false;
    }

    enableUndoRedo(): void {
        this.canUndoRedo = true;
    }

    addCommand(command: AbstractCommand): void {
        this.undoneList = [];
        this.commandList.push(command);
        this.sendUndoRedoNotif();
    }

    undo(): void {
        if (!this.canUndoRedo) return;
        if (this.commandList.length <= 1) return;

        const undoAction = this.commandList.pop();
        if (undoAction != undefined) {
            this.undoneList.push(undoAction);
            this.executeAllCommands();
        }
        this.sendUndoRedoNotif();
    }

    redo(): void {
        if (!this.canUndoRedo) return;
        if (this.undoneList.length !== 0) {
            const redoAction = this.undoneList.pop();
            if (redoAction != undefined) {
                this.commandList.push(redoAction);
                this.executeAllCommands();
            }
        }
        this.sendUndoRedoNotif();
    }

    private setBaseLine(baseLineCommand: AbstractCommand): void {
        this.commandList = [];
        this.undoneList = [];
        this.commandList[0] = baseLineCommand;
        this.sendUndoRedoNotif();
    }

    private executeAllCommands(): void {
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        for (const command of this.commandList) {
            command.execute();
        }
    }
}
