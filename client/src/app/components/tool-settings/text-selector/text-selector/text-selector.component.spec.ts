import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TextSelectorComponent } from './text-selector.component';

describe('TextSelectorComponent', () => {
    // let component: TextSelectorComponent;
    let fixture: ComponentFixture<TextSelectorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TextSelectorComponent],
            providers: [{ provide: MatBottomSheet, useValue: {} }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TextSelectorComponent);
        // component = fixture.componentInstance;
        fixture.detectChanges();
    });

    // it('should create', () => {
    //     expect(component).toBeTruthy();
    // });
});
