import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSliderChange } from '@angular/material/slider';
// import { MatSlideToggleChange } from '@angular/material/slide-toggle';
// import { MatSliderChange } from '@angular/material/slider';
import { By } from '@angular/platform-browser';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from '@app/services/tools/drawing-tool/line/line.service';

import { LineSettingsSelectorComponent } from './line-settings-selector.component';

fdescribe('LineSettingsSelectorComponent', () => {
    let component: LineSettingsSelectorComponent;
    let fixture: ComponentFixture<LineSettingsSelectorComponent>;
    const lineService: LineService = new LineService(new DrawingService(), new ColorService());
    // const drawWithJunctionExpected = true;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LineSettingsSelectorComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LineSettingsSelectorComponent);
        component = fixture.componentInstance;
        component.tool = lineService;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#change() from slider should toggle #updateDiameter()', () => {
        spyOn(component, 'updateDiameter');
        const slideToggle = fixture.debugElement.query(By.css('.junction-diameter-slider'));
        slideToggle.triggerEventHandler('change', null);
        expect(component.updateDiameter).toHaveBeenCalled();
    });

    it('#updateDiameter() should raise updateJunctionDiameterEmitter event', () => {
        const SLIDER_EXPECTED_VALUE = 30;
        const matSliderChange: MatSliderChange = new MatSliderChange();
        let sliderEmmitedValue = 0;

        matSliderChange.value = SLIDER_EXPECTED_VALUE;
        component.updateJunctionDiameterEmitter.subscribe((sliderValue: number) => (sliderEmmitedValue = sliderValue));
        component.updateDiameter(matSliderChange);
        expect(sliderEmmitedValue).toBe(SLIDER_EXPECTED_VALUE);
    });

    it('#change() from slide toggle should toggle #onChange()', () => {
        spyOn(component, 'onChange');
        const slideToggle = fixture.debugElement.query(By.css('.slide-toggle'));
        slideToggle.triggerEventHandler('change', null);
        expect(component.onChange).toHaveBeenCalled();
    });

    it('#onChange() should raise updatedotJunctionCheckedEmitter event', () => {
        const slideToggleExpectedValue = false;
        const slideToggle = fixture.debugElement.query(By.css('.slide-toggle'));
        const matSlideToggleChange: MatSlideToggleChange = new MatSlideToggleChange(slideToggle.nativeElement, slideToggleExpectedValue);
        let toggleEmmitedValue = true;

        component.updatedotJunctionCheckedEmitter.subscribe((toggleValue: boolean) => (toggleEmmitedValue = toggleValue));
        component.onChange(matSlideToggleChange);
        expect(toggleEmmitedValue).toBe(slideToggleExpectedValue);
    });
});
