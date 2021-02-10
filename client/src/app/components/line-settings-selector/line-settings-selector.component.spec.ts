import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from '@app/services/tools/drawing-tool/line/line.service';

import { LineSettingsSelectorComponent } from './line-settings-selector.component';

fdescribe('LineSettingsSelectorComponent', () => {
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

   
});
