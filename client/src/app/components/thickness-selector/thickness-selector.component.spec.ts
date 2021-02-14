import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { By } from '@angular/platform-browser';
import { DrawingTool } from '@app/classes/drawing-tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ThicknessSelectorComponent } from './thickness-selector.component';

describe('ThicknessSelectorComponent', () => {
    let component: ThicknessSelectorComponent;
    let fixture: ComponentFixture<ThicknessSelectorComponent>;
    const drawingTool: DrawingTool = new DrawingTool(new DrawingService(), new ColorService(), 'drawing tool');

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ThicknessSelectorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ThicknessSelectorComponent);
        component = fixture.componentInstance;
        component.tool = drawingTool;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('input from thickness-slider should toggle #updateThickness', () => {
        const thicknessSlider = fixture.debugElement.query(By.css('.thickness-slider'));
        spyOn(component, 'updateThickness');
        thicknessSlider.triggerEventHandler('input', null);
        expect(component.updateThickness).toHaveBeenCalled();
    });

    it('should raise thickness event when #updateThickness is called', () => {
        const SLIDER_EXPECTED_VALUE = 30;
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = SLIDER_EXPECTED_VALUE;

        spyOn(component.thickness, 'emit');
        component.updateThickness(matSliderChange);
        expect(component.thickness.emit).toHaveBeenCalled();
        expect(component.thickness.emit).toHaveBeenCalledWith(SLIDER_EXPECTED_VALUE);
    });
});
