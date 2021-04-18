import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MagnetSelectionService } from '@app/services/tools/selection/magnet-selection.service';
import { SelectedPoint } from '@app/services/tools/selection/move-selection.service';
import { PointSelectorComponent } from './point-selector.component';

describe('PointSelectorComponent', () => {
    let component: PointSelectorComponent;
    let fixture: ComponentFixture<PointSelectorComponent>;
    let magnetSelectionServiceSpyObj: jasmine.SpyObj<MagnetSelectionService>;

    beforeEach(async(() => {
        magnetSelectionServiceSpyObj = jasmine.createSpyObj('MagnetSelectionService', ['']);
        TestBed.configureTestingModule({
            providers: [
                { provide: MatBottomSheet, useValue: {} },
                { provide: MagnetSelectionService, useValue: magnetSelectionServiceSpyObj },
            ],
            declarations: [PointSelectorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
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

    it('#toggleActivePoint should toggle the the point to magnetize', () => {
        magnetSelectionServiceSpyObj.pointToMagnetize = SelectedPoint.TOP_LEFT;
        component.toggleActivePoint(SelectedPoint.BOTTOM_LEFT);
        expect(magnetSelectionServiceSpyObj.pointToMagnetize).toEqual(SelectedPoint.BOTTOM_LEFT);
    });
});
