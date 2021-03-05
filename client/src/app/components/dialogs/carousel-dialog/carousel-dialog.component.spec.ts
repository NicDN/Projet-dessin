import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselDialogComponent } from './carousel-dialog.component';

describe('CarouselDialogComponent', () => {
    let component: CarouselDialogComponent;
    let fixture: ComponentFixture<CarouselDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CarouselDialogComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CarouselDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
