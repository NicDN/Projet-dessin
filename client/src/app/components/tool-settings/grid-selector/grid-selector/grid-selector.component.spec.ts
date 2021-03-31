import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { GridService } from '@app/services/grid/grid.service';
import { GridSelectorComponent } from './grid-selector.component';

describe('GridSelectorComponent', () => {
    let component: GridSelectorComponent;
    let fixture: ComponentFixture<GridSelectorComponent>;

    let gridServiceSpyObj: jasmine.SpyObj<GridService>;
    const SLIDER_EXPECTED_VALUE = 25;

    const matSliderChange: MatSliderChange = new MatSliderChange();
    matSliderChange.value = SLIDER_EXPECTED_VALUE;

    beforeEach(async(() => {
        gridServiceSpyObj = jasmine.createSpyObj('GridService', ['']);
        TestBed.configureTestingModule({
            declarations: [GridSelectorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GridSelectorComponent);
        component = fixture.componentInstance;
        component.tool = gridServiceSpyObj;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('gridSettings should call the right #getAttribute function', () => {
        const EXPECTED_SQUARE_SIZE = 30;
        const EXPECTED_OPACITY_PERCENTAGE = 20;

        component.tool.squareSize = EXPECTED_SQUARE_SIZE;
        component.tool.opacity = EXPECTED_OPACITY_PERCENTAGE;

        expect(component.gridSettings[0].getAttribute()).toBe(EXPECTED_SQUARE_SIZE);
        expect(component.gridSettings[1].getAttribute()).toBe(EXPECTED_OPACITY_PERCENTAGE);
    });

    it('gridSettings should call the #action correctly', () => {
        const EXPECTED_VALUE = 20;

        component.gridSettings[0].action(EXPECTED_VALUE);
        expect(component.tool.squareSize).toBe(EXPECTED_VALUE);

        component.gridSettings[1].action(EXPECTED_VALUE);
        expect(component.tool.opacity).toBe(EXPECTED_VALUE);
    });
});
