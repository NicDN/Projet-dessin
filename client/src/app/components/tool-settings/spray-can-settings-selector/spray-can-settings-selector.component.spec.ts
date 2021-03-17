import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SprayCanService } from '@app/services/tools/spray-can/spray-can.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { SprayCanSettingsSelectorComponent } from './spray-can-settings-selector.component';

describe('SprayCanSettingsSelectorComponent', () => {
    let component: SprayCanSettingsSelectorComponent;
    let fixture: ComponentFixture<SprayCanSettingsSelectorComponent>;
    const sprayCanService: SprayCanService = new SprayCanService(new DrawingService(), new ColorService(), new UndoRedoService(new DrawingService()));
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
});
