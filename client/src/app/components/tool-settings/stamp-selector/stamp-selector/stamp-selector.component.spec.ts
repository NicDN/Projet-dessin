import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StampService } from '@app/services/tools/stamp/stamp.service';

import { StampSelectorComponent } from './stamp-selector.component';

// tslint:disable: no-string-literal
describe('StampSelectorComponent', () => {
    let component: StampSelectorComponent;
    let fixture: ComponentFixture<StampSelectorComponent>;

    const DEFAULT_SCALING_VALUE = 1;
    const DEFAULT_ANGLE_VALUE = 90;

    const stampServiceStub = {
        scaling: DEFAULT_SCALING_VALUE,
        angle: DEFAULT_ANGLE_VALUE,
    } as StampService;

    const EXPECTED_SCALING_VALUE = 2;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StampSelectorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [{ provide: StampService, useValue: stampServiceStub }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StampSelectorComponent);
        component = fixture.componentInstance;
        component.stampService.scaling = DEFAULT_SCALING_VALUE;
        component.stampService.angle = DEFAULT_ANGLE_VALUE;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#getAttribute of scalingSetting should return the scaling property', () => {
        component.stampService.scaling = EXPECTED_SCALING_VALUE;
        expect(component.scalingSetting.getAttribute()).toBe(EXPECTED_SCALING_VALUE);
    });

    it('#action of scalingSetting should set the scaling property', () => {
        component.scalingSetting.action(EXPECTED_SCALING_VALUE);
        expect(component.stampService.scaling).toBe(EXPECTED_SCALING_VALUE);
    });

    it('#getAttribute of angleSetting should return the angle property', () => {
        component.stampService.scaling = Math.PI;
        const EXPECTED_ANGLE_VALUE =
            Math.ceil(Math.abs((component.stampService.angle * component['PERCENTAGE_FACTOR']) / Math.PI)) % component['FULL_CIRCLE_DEGREES'];
        expect(component.angleSetting.getAttribute()).toBe(EXPECTED_ANGLE_VALUE);
    });

    it('#action of angleSetting should set the angle property', () => {
        const PROVIDED_ANGLE = 90;
        component.angleSetting.action(PROVIDED_ANGLE);
        const EXPECTED_ANGLE_VALUE = (component.stampService.angle = (PROVIDED_ANGLE * Math.PI) / component['PERCENTAGE_FACTOR']);
        expect(component.stampService.angle).toBe(EXPECTED_ANGLE_VALUE);
    });
});
