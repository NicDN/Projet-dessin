import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingControlPanelComponent } from './drawing-control-panel.component';

describe('DrawingControlPanelComponent', () => {
    let component: DrawingControlPanelComponent;
    let fixture: ComponentFixture<DrawingControlPanelComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DrawingControlPanelComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DrawingControlPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
