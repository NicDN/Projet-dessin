import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { PointSelectorComponent } from './point-selector.component';

describe('PointSelectorComponent', () => {
    let component: PointSelectorComponent;
    let fixture: ComponentFixture<PointSelectorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: MatBottomSheet, useValue: {} }],
            declarations: [PointSelectorComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PointSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
