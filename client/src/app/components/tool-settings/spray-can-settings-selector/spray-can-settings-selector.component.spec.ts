import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SprayCanSettingsSelectorComponent } from './spray-can-settings-selector.component';

describe('SprayCanSettingsSelectorComponent', () => {
    let component: SprayCanSettingsSelectorComponent;
    let fixture: ComponentFixture<SprayCanSettingsSelectorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SprayCanSettingsSelectorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SprayCanSettingsSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
