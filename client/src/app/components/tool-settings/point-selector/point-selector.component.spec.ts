import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MoveSelectionService, SelectedPoint } from '@app/services/tools/selection/move-selection.service';
import { PointSelectorComponent } from './point-selector.component';

describe('PointSelectorComponent', () => {
    let component: PointSelectorComponent;
    let fixture: ComponentFixture<PointSelectorComponent>;
    let moveSelectionServiceSpyObj: jasmine.SpyObj<MoveSelectionService>;

    beforeEach(async(() => {
        moveSelectionServiceSpyObj = jasmine.createSpyObj('MoveSelectionService', ['']);
        TestBed.configureTestingModule({
            providers: [
                { provide: MatBottomSheet, useValue: {} },
                { provide: MoveSelectionService, useValue: moveSelectionServiceSpyObj },
            ],
            declarations: [PointSelectorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
        moveSelectionServiceSpyObj.pointToMagnetize = SelectedPoint.TOP_LEFT;
        component.toggleActivePoint(SelectedPoint.BOTTOM_LEFT);
        expect(moveSelectionServiceSpyObj.pointToMagnetize).toEqual(SelectedPoint.BOTTOM_LEFT);
    });
});
