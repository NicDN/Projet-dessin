import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RectangleSelectionService } from '@app/services/tools/selection/rectangle-selection.service';
import { ToolsService } from '@app/services/tools/tools.service';
import { EllipseSelectionService } from './../../services/tools/selection/ellipse-selection.service';
import { SelectionOptionsComponent } from './selection-options.component';

describe('SelectionOptionsComponent', () => {
    let component: SelectionOptionsComponent;
    let fixture: ComponentFixture<SelectionOptionsComponent>;

    let toolsServiceSpyObj: jasmine.SpyObj<ToolsService>;
    let rectangleSelectionServiceSpyObj: jasmine.SpyObj<RectangleSelectionService>;
    let ellipseSelectionServiceSpyObj: jasmine.SpyObj<EllipseSelectionService>;

    beforeEach(async(() => {
        toolsServiceSpyObj = jasmine.createSpyObj('ToolsService', ['setCurrentTool']);
        rectangleSelectionServiceSpyObj = jasmine.createSpyObj('RectangleSelectionService', ['selectAll']);
        ellipseSelectionServiceSpyObj = jasmine.createSpyObj('EllipseSelectionService', ['']);
        TestBed.configureTestingModule({
            declarations: [SelectionOptionsComponent],
            providers: [
                { provide: ToolsService, useValue: toolsServiceSpyObj },
                { provide: RectangleSelectionService, useValue: rectangleSelectionServiceSpyObj },
                { provide: EllipseSelectionService, useValue: ellipseSelectionServiceSpyObj },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionOptionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#selectionIsActive should return true if there is a selection in process', () => {
        rectangleSelectionServiceSpyObj.hasSelection = false;
        ellipseSelectionServiceSpyObj.hasSelection = false;
        expect(component.selectionIsActive()).toBeFalse();

        rectangleSelectionServiceSpyObj.hasSelection = true;
        ellipseSelectionServiceSpyObj.hasSelection = true;
        expect(component.selectionIsActive()).toBeTrue();
    });

    it('#selectAll should change the current tool to rectangleSelectionService', () => {
        component.selectAll();
        expect(toolsServiceSpyObj.setCurrentTool).toHaveBeenCalled();
        expect(toolsServiceSpyObj.currentTool).toBe(toolsServiceSpyObj.rectangleSelectionService);
    });

    it('#selectAll should call the select all method from rectangle selection service', () => {
        component.selectAll();
        expect(rectangleSelectionServiceSpyObj.selectAll).toHaveBeenCalled();
    });
});
