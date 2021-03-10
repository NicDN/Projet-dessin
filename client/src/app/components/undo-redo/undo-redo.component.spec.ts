import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { UndoRedoComponent } from './undo-redo.component';
import { DrawingService } from '@app/services/drawing/drawing.service';


describe('UndoRedoComponent', () => {
    let component: UndoRedoComponent;
    let fixture: ComponentFixture<UndoRedoComponent>;
    // let undoRedoSpyObj: jasmine.SpyObj<UndoRedoService>;
    let undoRedoService = new UndoRedoService(new DrawingService);

    beforeEach(() => {

        // undoRedoSpyObj = jasmine.createSpyObj('UndoRedoService', ['addCommand']);
        TestBed.configureTestingModule({
            declarations: [UndoRedoComponent],
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
});
