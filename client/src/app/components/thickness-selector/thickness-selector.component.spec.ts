import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { DrawingTool } from '@app/classes/drawing-tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

import { ThicknessSelectorComponent } from './thickness-selector.component';

fdescribe('ThicknessSelectorComponent', () => {
    let component: ThicknessSelectorComponent;
    let fixture: ComponentFixture<ThicknessSelectorComponent>;
    const drawingTool: DrawingTool = new DrawingTool(new DrawingService(), new ColorService(), 'drawing tool');

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ThicknessSelectorComponent],
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

    it('should raise updateThicknessEmitter event when updateThickness is called', () => {
        const SLIDER_DEFAULT_VALUE = 30;
        const matSliderChange: MatSliderChange = new MatSliderChange();
        let sliderEmmitedValue = 0;

        matSliderChange.value = SLIDER_DEFAULT_VALUE;
        component.updateThicknessEmitter.subscribe((sliderValue: number) => (sliderEmmitedValue = sliderValue));
        component.updateThickness(matSliderChange);
        expect(sliderEmmitedValue).toBe(SLIDER_DEFAULT_VALUE);
    });
});
