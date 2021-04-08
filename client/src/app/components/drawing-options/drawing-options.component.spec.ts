import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { GridService } from '@app/services/grid/grid.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { of } from 'rxjs';
import { DrawingOptionsComponent } from './drawing-options.component';

// tslint:disable: no-string-literal
// tslint:disable: no-any
describe('DrawingOptions', () => {
    let component: DrawingOptionsComponent;
    let fixture: ComponentFixture<DrawingOptionsComponent>;
    let undoRedoServiceSpyObj: jasmine.SpyObj<UndoRedoService>;
    let toolsServiceSpyObj: jasmine.SpyObj<ToolsService>;
    let gridServiceSpyObj: jasmine.SpyObj<GridService>;

    beforeEach(() => {
        undoRedoServiceSpyObj = jasmine.createSpyObj('UndoRedoService', [
            'updateUndoRedoValues',
            'newUndoRedoSignals',
            'redoListIsEmpty',
            'commandListIsEmpty',
            'sendUndoRedoNotif',
        ]);
        toolsServiceSpyObj = jasmine.createSpyObj('ToolsService', ['setCurrentTool']);
        gridServiceSpyObj = jasmine.createSpyObj('GridService', ['handleDrawGrid']);
        // tslint:disable-next-line: prefer-const no-any
        let randomMsg: any;
        undoRedoServiceSpyObj.newUndoRedoSignals.and.returnValue(of(randomMsg));

        TestBed.configureTestingModule({
            declarations: [DrawingOptionsComponent],
            providers: [
                { provide: UndoRedoService, useValue: undoRedoServiceSpyObj },
                { provide: ToolsService, useValue: toolsServiceSpyObj },
                { provide: GridService, useValue: gridServiceSpyObj },
                { provide: MatBottomSheet, useValue: {} },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(DrawingOptionsComponent);
        toolsServiceSpyObj.gridService = TestBed.inject(GridService);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#updateUndoRedoValues should set commandListIsEmpty to false if there are commands in stack', () => {
        undoRedoServiceSpyObj.commandListIsEmpty.and.returnValue(false);
        component['updateUndoRedoValues']();
        expect(component.commandListIsEmpty).toBeFalse();
    });

    it('#updateUndoRedoValues should set commandListIsEmpty to true if there are commands in stack', () => {
        undoRedoServiceSpyObj.commandListIsEmpty.and.returnValue(true);
        component['updateUndoRedoValues']();
        expect(component.commandListIsEmpty).toBeTrue();
    });

    it('#updateUndoRedoValues should set redoneListIsEmpty to false if there are no commands in stack', () => {
        undoRedoServiceSpyObj.redoListIsEmpty.and.returnValue(false);
        component['updateUndoRedoValues']();
        expect(component.redoListIsEmpty).toBeFalse();
    });

    it('#updateUndoRedoValues should set redoneListIsEmpty to true if there are commands in stack', () => {
        undoRedoServiceSpyObj.redoListIsEmpty.and.returnValue(true);
        component['updateUndoRedoValues']();
        expect(component.redoListIsEmpty).toBeTrue();
    });

    it('#listenToResizeNotifications should update undoRedoValues when receiving an update', () => {
        const updateUndoRedoValuesSpy = spyOn<any>(component, 'updateUndoRedoValues');
        component['listenToUndoRedoNotification']();
        undoRedoServiceSpyObj['sendUndoRedoNotif']();
        expect(updateUndoRedoValuesSpy).toHaveBeenCalled();
    });

    it('#handleClickGrid should set the current tool to grid and call handleDrawGrid of grid service', () => {
        component.handleClickGrid();
        expect(gridServiceSpyObj.handleDrawGrid).toHaveBeenCalled();
    });
});
