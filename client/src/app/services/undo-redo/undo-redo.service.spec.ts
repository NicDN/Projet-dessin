import { AbstractCommand } from '@app/classes/commands/abstract-command';
import { TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from './undo-redo.service';

class TestCommand extends AbstractCommand {
    proprety: number = 0;
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

    it('#addCommand should reset the redo action list',() => {
        const command1: TestCommand = new TestCommand();
        service.undoneList.push(command1);
        service.addCommand(command1);
        expect(service.undoneList.length).toEqual(0);
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
