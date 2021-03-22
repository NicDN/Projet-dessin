import { TestBed } from '@angular/core/testing';
import { BoxSize } from '@app/classes/box-size';
import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { BaseLineCommand } from '@app/classes/commands/base-line-command/base-line-command';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { of, Subject } from 'rxjs';
import { UndoRedoService } from './undo-redo.service';

export class TestCommand extends AbstractCommand {
    proprety: number = 0;
    id: number;
    execute(): void {
        this.proprety = 1;
    }
}

// tslint:disable: no-any
// tslint:disable: no-string-literal
describe('UndoRedoService', () => {
    let service: UndoRedoService;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    const canvasStub: HTMLCanvasElement = document.createElement('canvas');
    let canvasCtxStub: CanvasRenderingContext2D;
    const boxSizeStub: BoxSize = { widthBox: 1, heightBox: 1 };

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', [
            'clearCanvas',
            'newBaseLineSignals',
            'newIncomingResizeSignals',
            'sendNotifToResize',
            'executeBaseLine',
        ]);
        const stubWidthAndHeight = 100;
        const stubFillRectWidthAndHeight = 100;
        drawingServiceSpyObj.newIncomingResizeSignals.and.returnValue(of(boxSizeStub));
        canvasStub.width = stubWidthAndHeight;
        canvasStub.height = stubWidthAndHeight;
        canvasCtxStub = canvasStub.getContext('2d') as CanvasRenderingContext2D;
        canvasCtxStub.fillStyle = 'black';
        canvasCtxStub.fillRect(0, 0, stubFillRectWidthAndHeight, stubFillRectWidthAndHeight);

        drawingServiceSpyObj.canvas = canvasStub;

        const image = new Image();
        image.src = canvasStub.toDataURL();
        const baseLineStub = new BaseLineCommand(drawingServiceSpyObj, image);
        drawingServiceSpyObj.newBaseLineSignals.and.returnValue(of(baseLineStub));

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpyObj }],
        });
        service = TestBed.inject(UndoRedoService);
        service['commandList'] = [];
        service['undoneList'] = [];
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
        service['undoneList'].push(command1);
        service.addCommand(command1);
        expect(service['undoneList'].length).toEqual(0);
    });

    it('#addCommand should add a command to the commandList', () => {
        const command1: TestCommand = new TestCommand();
        service['commandList'].push(command1);
        expect(service['commandList'].length).toEqual(1);
    });

    it('#undo should add the latest command executed to the undoneList', () => {
        const commandFirst: TestCommand = new TestCommand();
        const commandSecond: TestCommand = new TestCommand();
        commandFirst.id = 1;
        commandSecond.id = 2;
        service.addCommand(commandFirst);
        service.addCommand(commandSecond);
        service.undo();
        const commandPopped = service['undoneList'].pop();
        expect(commandPopped).toEqual(commandSecond);
        expect(commandPopped).not.toEqual(commandFirst);
    });

    it('#undo should not undo if there is an action in process', () => {
        const executeAllCmds = spyOn<any>(service, 'executeAllCommands');
        service['canUndoRedo'] = false;
        service.undo();
        expect(executeAllCmds).not.toHaveBeenCalled();
    });

    it('#undo should not undo if the number of elements in the commad list is under the start commands', () => {
        const executeAllCmdSpy = spyOn<any>(service, 'executeAllCommands');
        service.undo();
        expect(service['commandList'].length).toEqual(0);
        expect(executeAllCmdSpy).not.toHaveBeenCalled();
    });

    it('#undo should not execute all commands if there is an undefined object', () => {
        const executeAllCmds = spyOn<any>(service, 'executeAllCommands');
        service['canUndoRedo'] = true;
        service['commandList'].length = 2;
        service.undo();
        expect(executeAllCmds).not.toHaveBeenCalled();
    });

    it('#redo should add the latest command pushed to the undoneList to the commandList', () => {
        const commandFirst: TestCommand = new TestCommand();
        const commandSecond: TestCommand = new TestCommand();
        commandFirst.id = 1;
        commandSecond.id = 2;
        service['undoneList'].push(commandFirst);
        service['undoneList'].push(commandSecond);
        service.redo();
        const commandPopped = service['commandList'].pop();
        expect(commandPopped).toEqual(commandSecond);
        expect(commandPopped).not.toEqual(commandFirst);
    });

    it('#redo should not redo if there is an action in process', () => {
        const executeAllCmds = spyOn<any>(service, 'executeAllCommands');
        service['canUndoRedo'] = false;
        service.redo();
        expect(executeAllCmds).not.toHaveBeenCalled();
    });

    it('#redo should not executeAll if there are no elements inside of it', () => {
        const executeAllCmdSpy = spyOn<any>(service, 'executeAllCommands');
        service.redo();
        expect(executeAllCmdSpy).not.toHaveBeenCalled();
    });

    it('#redo should execute all if there is an undefined action', () => {
        const executeAllCmds = spyOn<any>(service, 'executeAllCommands');
        service['canUndoRedo'] = true;
        service['undoneList'].length = 1;
        service.redo();
        expect(executeAllCmds).not.toHaveBeenCalled();
    });

    it('#executeAllCommands should clear the canvas', () => {
        service['executeAllCommands']();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
    });

    it('#setBaseLine should change the base line of commands', () => {
        const commandBaseLine: TestCommand = new TestCommand();
        const command1: TestCommand = new TestCommand();
        const newBaseLine: TestCommand = new TestCommand();
        service['commandList'][0] = commandBaseLine;
        service['commandList'][1] = command1;
        service['setBaseLine'](newBaseLine);
        expect(service['commandList'][0]).toBe(newBaseLine);
        expect(service['commandList'].length).toEqual(1);
        expect(service['undoneList'].length).toEqual(0);
    });

    it('#executeAllCommands should execute all commands', () => {
        const command1: TestCommand = new TestCommand();
        const command2: TestCommand = new TestCommand();
        service['commandList'].push(command1);
        service['commandList'].push(command2);
        service['executeAllCommands']();
        expect(command1.proprety).toEqual(1);
        expect(command2.proprety).toEqual(1);
    });

    it('#commandListIsEmpty should return true if the command list is empty', () => {
        const baseLineCommandTmp: TestCommand = new TestCommand();
        service.addCommand(baseLineCommandTmp);
        expect(service.commandListIsEmpty()).toBeTrue();
    });

    it('#commandListIsEmpty should return false if the command list is not empty', () => {
        const baseLineCommandTmp: TestCommand = new TestCommand();
        service.addCommand(baseLineCommandTmp);
        service.addCommand(baseLineCommandTmp);
        expect(service.commandListIsEmpty()).toBeFalse();
    });

    it('#redoListIsEmpty should return true if the redo list is empty', () => {
        expect(service.redoListIsEmpty()).toBeTrue();
    });

    it('#redoListIsEmpty should return false if the redo list is not empty', () => {
        const baseLineCommandTmp: TestCommand = new TestCommand();
        service['undoneList'].push(baseLineCommandTmp);
        service['undoneList'].push(baseLineCommandTmp);
        expect(service.redoListIsEmpty()).toBeFalse();
    });

    it('#sendUndoRedoNotif should return an observable subject', () => {
        const expectedSubject: Subject<void> = new Subject<void>();
        service['updateUndoRedoComponent'] = expectedSubject;
        expect(service.newUndoRedoSignals()).toEqual(expectedSubject.asObservable());
    });
});
