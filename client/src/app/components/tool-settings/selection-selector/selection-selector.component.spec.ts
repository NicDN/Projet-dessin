import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectionSelectorComponent } from './selection-selector.component';

describe('SelectionSelectorComponent', () => {
    let component: SelectionSelectorComponent;
    let fixture: ComponentFixture<SelectionSelectorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SelectionSelectorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
