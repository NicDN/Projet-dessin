import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridSelectorComponent } from './grid-selector.component';

describe('GridSelectorComponent', () => {
    let component: GridSelectorComponent;
    let fixture: ComponentFixture<GridSelectorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GridSelectorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GridSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
