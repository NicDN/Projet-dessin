import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { BottomSheetConfirmNewDrawingComponent } from './bottom-sheet-confirm-new-drawing.component';

describe('BottomSheetConfirmNewDrawingComponent', () => {
    let component: BottomSheetConfirmNewDrawingComponent;
    let fixture: ComponentFixture<BottomSheetConfirmNewDrawingComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BottomSheetConfirmNewDrawingComponent],
            providers: [
                { provide: MatBottomSheet, useValue: {} },
                { provide: MatBottomSheetRef, useValue: {} },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BottomSheetConfirmNewDrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
