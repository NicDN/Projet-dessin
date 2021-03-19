import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { SprayCanService } from '@app/services/tools/spray-can/spray-can.service';
import { SprayCanSettingsSelectorComponent } from './spray-can-settings-selector.component';

describe('SprayCanSettingsSelectorComponent', () => {
    let component: SprayCanSettingsSelectorComponent;
    let fixture: ComponentFixture<SprayCanSettingsSelectorComponent>;

    let sprayCanServiceSpy: jasmine.SpyObj<SprayCanService>;

    const SLIDER_EXPECTED_VALUE = 6;
    const matSliderChange: MatSliderChange = new MatSliderChange();
    matSliderChange.value = SLIDER_EXPECTED_VALUE;

    beforeEach(async(() => {
        sprayCanServiceSpy = jasmine.createSpyObj('SprayCanService', ['']);
        TestBed.configureTestingModule({
            declarations: [SprayCanSettingsSelectorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SprayCanSettingsSelectorComponent);
        component = fixture.componentInstance;
        component.tool = sprayCanServiceSpy;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('sprayCanSettings should call the right #getAttribute function', () => {
        const EXPECTED_EMISSION_RATE = 10;
        const EXPECTED_SPRAY_DIAMETER = 10;
        const EXPECTED_DROPLETS_DIAMETER = 10;

        component.tool.emissionRate = EXPECTED_EMISSION_RATE;
        component.tool.sprayDiameter = EXPECTED_SPRAY_DIAMETER;
        component.tool.dropletsDiameter = EXPECTED_DROPLETS_DIAMETER;

        expect(component.sprayCanSettings[0].getAttribute()).toBe(EXPECTED_EMISSION_RATE);
        expect(component.sprayCanSettings[1].getAttribute()).toBe(EXPECTED_SPRAY_DIAMETER);
        expect(component.sprayCanSettings[2].getAttribute()).toBe(EXPECTED_DROPLETS_DIAMETER);
    });

    it('sprayCanSettings should call #action correctly', () => {
        const EXPECTED_VALUE = 10;

        component.sprayCanSettings[0].action(EXPECTED_VALUE);
        expect(component.tool.emissionRate).toBe(EXPECTED_VALUE);

        component.sprayCanSettings[1].action(EXPECTED_VALUE);
        expect(component.tool.sprayDiameter).toBe(EXPECTED_VALUE);

        component.sprayCanSettings[2].action(EXPECTED_VALUE);
        expect(component.tool.dropletsDiameter).toBe(EXPECTED_VALUE);
    });
});
