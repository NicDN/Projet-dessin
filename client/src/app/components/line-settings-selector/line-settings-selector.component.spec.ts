import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineSettingsSelectorComponent } from './line-settings-selector.component';

describe('LineSettingsSelectorComponent', () => {
    let component: LineSettingsSelectorComponent;
    let fixture: ComponentFixture<LineSettingsSelectorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LineSettingsSelectorComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LineSettingsSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
