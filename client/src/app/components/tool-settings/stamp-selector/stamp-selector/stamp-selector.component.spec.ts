import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StampSelectorComponent } from './stamp-selector.component';

describe('StampSelectorComponent', () => {
    let component: StampSelectorComponent;
    let fixture: ComponentFixture<StampSelectorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StampSelectorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StampSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
