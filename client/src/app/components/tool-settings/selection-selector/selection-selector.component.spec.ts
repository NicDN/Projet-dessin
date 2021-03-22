import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle-selection.service';
import { ToolsService } from '@app/services/tools/tools.service';

import { SelectionSelectorComponent } from './selection-selector.component';

describe('SelectionSelectorComponent', () => {
    let component: SelectionSelectorComponent;
    let fixture: ComponentFixture<SelectionSelectorComponent>;
    let toolsServiceSpy: jasmine.SpyObj<ToolsService>;
    let rectangleSelectionServiceSpy: jasmine.SpyObj<RectangleSelectionService>;

    beforeEach(async(() => {
        toolsServiceSpy = jasmine.createSpyObj('ToolsService', ['setCurrentTool']);
        rectangleSelectionServiceSpy = jasmine.createSpyObj('RectangleSelectionService', ['']);
        TestBed.configureTestingModule({
            declarations: [SelectionSelectorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [{ provide: ToolsService, useValue: toolsServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionSelectorComponent);
        component = fixture.componentInstance;
        toolsServiceSpy.rectangleSelectionService = rectangleSelectionServiceSpy;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#toggleActive should set the right selection tool', () => {
        component.toggleActive(rectangleSelectionServiceSpy);
        expect(toolsServiceSpy.setCurrentTool).toHaveBeenCalledWith(rectangleSelectionServiceSpy);
    });
});
