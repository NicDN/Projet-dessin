import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { CarouselDialogComponent } from './carousel-dialog.component';

describe('CarouselDialogComponent', () => {
    let component: CarouselDialogComponent;
    let fixture: ComponentFixture<CarouselDialogComponent>;
    let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<CarouselDialogComponent>>;

    beforeEach(async(() => {
        matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        TestBed.configureTestingModule({
            declarations: [CarouselDialogComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule],
            providers: [{ provide: MatDialogRef, useValue: matDialogRefSpy }],
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
