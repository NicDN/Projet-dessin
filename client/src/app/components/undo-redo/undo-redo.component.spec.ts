import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { of } from 'rxjs';
import { UndoRedoComponent } from './undo-redo.component';

describe('UndoRedoComponent', () => {
    let component: UndoRedoComponent;
    let fixture: ComponentFixture<UndoRedoComponent>;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;
    const undoRedoService = new UndoRedoService(new DrawingService());

    beforeEach(() => {
        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', ['addCommand', 'updateUndoRedoValues', 'newUndoRedoSignals']);
        undoRedoServiceSpyObj.newUndoRedoSignals.and.returnValue(of());
        TestBed.configureTestingModule({
            declarations: [UndoRedoComponent],
            providers: [{ provide: UndoRedoService, useValue: undoRedoServiceSpyObj }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
        fixture = TestBed.createComponent(UndoRedoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        component.undoRedoService = undoRedoService;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should ', () => {});
});
