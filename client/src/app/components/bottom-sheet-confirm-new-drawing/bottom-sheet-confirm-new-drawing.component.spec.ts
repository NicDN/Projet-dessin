import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { BottomSheetConfirmNewDrawingComponent } from './bottom-sheet-confirm-new-drawing.component';

describe('BottomSheetConfirmNewDrawingComponent', () => {
    let component: BottomSheetConfirmNewDrawingComponent;
    let fixture: ComponentFixture<BottomSheetConfirmNewDrawingComponent>;

    const matBottomSheetRef = jasmine.createSpyObj<MatBottomSheetRef>('MatBottomSheetRef', ['dismiss']);

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BottomSheetConfirmNewDrawingComponent],
            providers: [
                { provide: MatBottomSheet, useValue: {} },
                { provide: MatBottomSheetRef, useValue: matBottomSheetRef },
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

    it('#closeBottomSheet should close bottom sheet correctly', () => {
        component.closeBottomSheet(true);
        expect(matBottomSheetRef.dismiss).toHaveBeenCalledWith(true);
    });

    it('#onKeyDown should not close bottom sheet if the key pressed is not enter', () => {
        spyOn(component, 'closeBottomSheet');
        const keyboardEvent: KeyboardEvent = { key: 'Not enter' } as KeyboardEvent;
        component.onKeyDown(keyboardEvent);
        expect(component.closeBottomSheet).not.toHaveBeenCalled();
    });

    it('#onKeyDown should close bottom sheet if the key pressed is enter', () => {
        spyOn(component, 'closeBottomSheet');
        const keyboardEvent: KeyboardEvent = { key: 'Enter' } as KeyboardEvent;
        component.onKeyDown(keyboardEvent);
        expect(component.closeBottomSheet).toHaveBeenCalledWith(true);
    });
});
