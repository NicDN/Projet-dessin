import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSliderChange } from '@angular/material/slider';
import { By } from '@angular/platform-browser';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from '@app/services/tools/drawing-tool/line/line.service';
import { LineSettingsSelectorComponent } from './line-settings-selector.component';

describe('LineSettingsSelectorComponent', () => {
    let component: LineSettingsSelectorComponent;
    let fixture: ComponentFixture<LineSettingsSelectorComponent>;
    const lineService: LineService = new LineService(new DrawingService(), new ColorService());

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

    it('change from junction-diameter-slider should toggle #updateDiameter', () => {
        spyOn(component, 'updateDiameter');
        const slideToggle = fixture.debugElement.query(By.css('.junction-diameter-slider'));
        slideToggle.triggerEventHandler('change', null);
        expect(component.updateDiameter).toHaveBeenCalled();
    });

    it('#updateDiameter should raise junctionDiameter event', () => {
        const SLIDER_EXPECTED_VALUE = 30;
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = SLIDER_EXPECTED_VALUE;

        spyOn(component.junctionDiameter, 'emit');
        component.updateDiameter(matSliderChange);
        expect(component.junctionDiameter.emit).toHaveBeenCalled();
        expect(component.junctionDiameter.emit).toHaveBeenCalledWith(SLIDER_EXPECTED_VALUE);
    });

    it('change from slide toggle should toggle #updateJunction', () => {
        spyOn(component, 'updateJunction');
        const slideToggle = fixture.debugElement.query(By.css('.slide-toggle'));
        slideToggle.triggerEventHandler('change', null);
        expect(component.updateJunction).toHaveBeenCalled();
    });

    it('#updateJunction should raise junction event', () => {
        const slideToggleExpectedValue = false;
        const slideToggle = fixture.debugElement.query(By.css('.slide-toggle'));
        const matSlideToggleChange: MatSlideToggleChange = new MatSlideToggleChange(slideToggle.nativeElement, slideToggleExpectedValue);

        spyOn(component.junction, 'emit');
        component.updateJunction(matSlideToggleChange);
        expect(component.junction.emit).toHaveBeenCalled();
        expect(component.junction.emit).toHaveBeenCalledWith(slideToggleExpectedValue);
    });
});
