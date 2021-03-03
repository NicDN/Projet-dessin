import { TestBed } from '@angular/core/testing';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from './undo-redo.service';

class TestCommand extends AbstractCommand {
    proprety: number = 0;
    id: number;
    execute(): void {
        this.proprety = 1;
    }
}

// tslint:disable: no-string-literal
fdescribe('UndoRedoService', () => {
    let service: UndoRedoService;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpyObj }],
        });
        service = TestBed.inject(UndoRedoService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#disableRedo should disable redo', () => {
        service['canUndoRedo'] = true;
        service.disableUndoRedo();
        expect(service['canUndoRedo']).toBeFalse();
    });

    it('#enbableRedo should enable redo', () => {
        service['canUndoRedo'] = false;
        service.enableUndoRedo();
        expect(service['canUndoRedo']).toBeTrue();
    });

    it('#addCommand should reset the redo action list', () => {
        const command1: TestCommand = new TestCommand();
        service.undoneList.push(command1);
        service.addCommand(command1);
        expect(service.undoneList.length).toEqual(0);
    });

    it('#addCommand should add a command to the commandList', () => {
        const command1: TestCommand = new TestCommand();
        service.commandList.push(command1);
        expect(service.commandList.length).toEqual(1);
    });

    it('#undo should add the latest command executed to the undoneList', () => {
        const commandFirst: TestCommand = new TestCommand();
        const commandSecond: TestCommand = new TestCommand();
        commandFirst.id = 1;
        commandSecond.id = 2;
        service.addCommand(commandFirst);
        service.addCommand(commandSecond);
        service.undo();
        const commandPopped = service.undoneList.pop();
        expect(commandPopped).toEqual(commandSecond);
        expect(commandPopped).not.toEqual(commandFirst);
    });

    it('#undo should not undo if there is an action in process', () => {
        const executeAllCmds = spyOn(service, 'executeAllCommands');
        service['canUndoRedo'] = false;
        service.undo();
        expect(executeAllCmds).not.toHaveBeenCalled();
    });

    it('#undo should not undo if the number of elements in the commad list is under the start commands', () => {
        const baseCmd: TestCommand = new TestCommand();
        service.commandList.push(baseCmd);
        const executeAllCmdSpy = spyOn(service, 'executeAllCommands');
        service.undo();
        expect(executeAllCmdSpy).not.toHaveBeenCalled();
    });

    it('#undo should not execute all commands if there is an undefined object', () => {
        const executeAllCmds = spyOn(service, 'executeAllCommands');
        service['canUndoRedo'] = true;
        service.commandList.length = 2;
        service.undo();
        expect(executeAllCmds).not.toHaveBeenCalled();
    });

    it('#redo should add the latest command pushed to the undoneList to the commandList', () => {
        const commandFirst: TestCommand = new TestCommand();
        const commandSecond: TestCommand = new TestCommand();
        commandFirst.id = 1;
        commandSecond.id = 2;
        service.undoneList.push(commandFirst);
        service.undoneList.push(commandSecond);
        service.redo();
        const commandPopped = service.commandList.pop();
        expect(commandPopped).toEqual(commandSecond);
        expect(commandPopped).not.toEqual(commandFirst);
    });

    it('#redo should not redo if there is an action in process', () => {
        const executeAllCmds = spyOn(service, 'executeAllCommands');
        service['canUndoRedo'] = false;
        service.redo();
        expect(executeAllCmds).not.toHaveBeenCalled();
    });

    it('#redo should not executeAll if there are no elements inside of it', () => {
        const executeAllCmdSpy = spyOn(service, 'executeAllCommands');
        service.redo();
        expect(executeAllCmdSpy).not.toHaveBeenCalled();
    });

    it('#redo should execute all if there is an undefined action', () => {
        const executeAllCmds = spyOn(service, 'executeAllCommands');
        service['canUndoRedo'] = true;
        service.undoneList.length = 1;
        service.redo();
        expect(executeAllCmds).not.toHaveBeenCalled();
    });

    it('#executeAllCommands should clear the canvas', () => {
        service.executeAllCommands();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
    });

    it('#executeAllCommands should execute all commands', () => {
        const command1: TestCommand = new TestCommand();
        const command2: TestCommand = new TestCommand();
        service.commandList.push(command1);
        service.commandList.push(command2);
        service.executeAllCommands();
        expect(command1.proprety).toEqual(1);
        expect(command2.proprety).toEqual(1);
    });
});
