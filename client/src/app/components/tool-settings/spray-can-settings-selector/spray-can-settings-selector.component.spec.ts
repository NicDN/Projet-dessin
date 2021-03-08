import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SprayCanService } from '@app/services/tools/spray-can/spray-can.service';
import { SprayCanSettingsSelectorComponent } from './spray-can-settings-selector.component';

describe('SprayCanSettingsSelectorComponent', () => {
    let component: SprayCanSettingsSelectorComponent;
    let fixture: ComponentFixture<SprayCanSettingsSelectorComponent>;
    const sprayCanService: SprayCanService = new SprayCanService(new DrawingService(), new ColorService());
    const SLIDER_EXPECTED_VALUE = 6;
    const matSliderChange: MatSliderChange = new MatSliderChange();
    matSliderChange.value = SLIDER_EXPECTED_VALUE;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SprayCanSettingsSelectorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SprayCanSettingsSelectorComponent);
        component = fixture.componentInstance;
        component.tool = sprayCanService;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#updateEmissionRate should update the current tool emission', () => {
        component.updateEmissionRate(matSliderChange);
        expect(component.tool.emissionRate).toEqual(SLIDER_EXPECTED_VALUE);
    });

    it('#updateDropletsDiameter should raise the spray diameter', () => {
        component.updateDropletsDiameter(matSliderChange);
        expect(component.tool.dropletsDiameter).toEqual(SLIDER_EXPECTED_VALUE);
    });

    it('#updateSprayDiameter should raise the spray diameter', () => {
        component.updateSprayDiameter(matSliderChange);
        expect(component.tool.sprayDiameter).toEqual(SLIDER_EXPECTED_VALUE);
    });
});
