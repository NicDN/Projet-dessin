import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { of } from 'rxjs';
import { UndoRedoComponent } from './undo-redo.component';

describe('UndoRedoComponent', () => {
    let component: UndoRedoComponent;
    let fixture: ComponentFixture<UndoRedoComponent>;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;

    beforeEach(() => {
        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', [
            'updateUndoRedoValues',
            'newUndoRedoSignals',
            'redoListIsEmpty',
            'commandListIsEmpty',
            'sendUndoRedoNotif',
        ]);
        // tslint:disable-next-line: prefer-const no-any
        let something: any;
        undoRedoServiceSpyObj.newUndoRedoSignals.and.returnValue(of(something));
        TestBed.configureTestingModule({
            declarations: [UndoRedoComponent],
            providers: [{ provide: UndoRedoService, useValue: undoRedoServiceSpyObj }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
        fixture = TestBed.createComponent(UndoRedoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#updateUndoRedoValues should set commandListIsEmpty to false if there are commands in stack', () => {
        undoRedoServiceSpyObj.commandListIsEmpty.and.returnValue(false);
        component.updateUndoRedoValues();
        expect(component.commandListIsEmpty).toBeFalse();
    });

    it('#updateUndoRedoValues should set commandListIsEmpty to true if there are commands in stack', () => {
        undoRedoServiceSpyObj.commandListIsEmpty.and.returnValue(true);
        component.updateUndoRedoValues();
        expect(component.commandListIsEmpty).toBeTrue();
    });

    it('#updateUndoRedoValues should set redoneListIsEmpty to false if there are no commands in stack', () => {
        undoRedoServiceSpyObj.redoListIsEmpty.and.returnValue(false);
        component.updateUndoRedoValues();
        expect(component.redoListIsEmpty).toBeFalse();
    });

    it('#updateUndoRedoValues should set redoneListIsEmpty to true if there are commands in stack', () => {
        undoRedoServiceSpyObj.redoListIsEmpty.and.returnValue(true);
        component.updateUndoRedoValues();
        expect(component.redoListIsEmpty).toBeTrue();
    });

    it('#listenToResizeNotifications should update undoRedoValues when receiving an update', () => {
        const updateUndoRedoValuesSpy = spyOn(component, 'updateUndoRedoValues');
        component.listenToUndoRedoNotification();
        undoRedoServiceSpyObj.sendUndoRedoNotif();
        expect(updateUndoRedoValuesSpy).toHaveBeenCalled();
    });
});
