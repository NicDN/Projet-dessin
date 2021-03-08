import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { UndoRedoComponent } from './undo-redo.component';

describe('UndoRedoComponent', () => {
    let component: UndoRedoComponent;
    let fixture: ComponentFixture<UndoRedoComponent>;
    let undoRedoSpyObj: jasmine.SpyObj<UndoRedoService>;
    beforeEach(async(() => {
        undoRedoSpyObj = jasmine.createSpyObj('UndoRedoService', ['']);
        TestBed.configureTestingModule({
            declarations: [UndoRedoComponent],
            providers: [{ provide: UndoRedoService, useValue: undoRedoSpyObj }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UndoRedoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
