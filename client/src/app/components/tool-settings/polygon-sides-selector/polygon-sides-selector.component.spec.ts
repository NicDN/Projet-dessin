import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { By } from '@angular/platform-browser';
import { Shape } from '@app/classes/shape';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PolygonService } from '@app/services/tools/shape/polygon/polygon.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { PolygonSidesSelectorComponent } from './polygon-sides-selector.component';

describe('PolygonSidesSelectorComponent', () => {
    let component: PolygonSidesSelectorComponent;
    let fixture: ComponentFixture<PolygonSidesSelectorComponent>;
    const polygon: Shape = new PolygonService(new DrawingService(), new ColorService(), new UndoRedoService(new DrawingService()));

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PolygonSidesSelectorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PolygonSidesSelectorComponent);
        component = fixture.componentInstance;
        component.polygon = polygon;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('input from sides-slider should toggle #updateNumberOfSides', () => {
        const sidesSlider = fixture.debugElement.query(By.css('.sides-slider'));
        const updateSlider = spyOn(component, 'updateNumberOfSides');
        sidesSlider.triggerEventHandler('input', null);
        expect(updateSlider).toHaveBeenCalled();
    });

    it('should raise thickness event when #updateNumberOfSides is called', () => {
        const SLIDER_EXPECTED_VALUE = 6;
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = SLIDER_EXPECTED_VALUE;

        const updateSides = spyOn(component.numberOfSides, 'emit');
        component.updateNumberOfSides(matSliderChange);
        expect(updateSides).toHaveBeenCalled();
        expect(updateSides).toHaveBeenCalledWith(SLIDER_EXPECTED_VALUE);
    });
});
