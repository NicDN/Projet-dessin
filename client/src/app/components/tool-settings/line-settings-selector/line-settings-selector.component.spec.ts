import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSliderChange } from '@angular/material/slider';
import { By } from '@angular/platform-browser';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from '@app/services/tools/trace-tool/line/line.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { LineSettingsSelectorComponent } from './line-settings-selector.component';

describe('LineSettingsSelectorComponent', () => {
    let component: LineSettingsSelectorComponent;
    let fixture: ComponentFixture<LineSettingsSelectorComponent>;
    const undoRedoServiceSpy: UndoRedoService = {} as UndoRedoService;
    const lineService: LineService = new LineService(new DrawingService({} as MatBottomSheet), new ColorService(), undoRedoServiceSpy);

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LineSettingsSelectorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
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

    it('change from slide toggle should toggle #updateJunction', () => {
        spyOn(component, 'updateJunction');
        const slideToggle = fixture.debugElement.query(By.css('.slide-toggle'));
        slideToggle.triggerEventHandler('change', null);
        expect(component.updateJunction).toHaveBeenCalled();
    });

    it('#updateDiameter should update the tool diameter', () => {
        const SLIDER_EXPECTED_VALUE = 30;
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = SLIDER_EXPECTED_VALUE;
        component.updateDiameter(matSliderChange);
        expect(component.tool.junctionDiameter).toBe(SLIDER_EXPECTED_VALUE);
    });

    it('#updateJunction should update the type of junction', () => {
        const slideToggleExpectedValue = false;
        const slideToggle = fixture.debugElement.query(By.css('.slide-toggle'));
        const matSlideToggleChange: MatSlideToggleChange = new MatSlideToggleChange(slideToggle.nativeElement, slideToggleExpectedValue);
        component.updateJunction(matSlideToggleChange);
        expect(component.tool.drawWithJunction).toBe(slideToggleExpectedValue);
    });
});
