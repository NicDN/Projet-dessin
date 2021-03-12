import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { SaveDialogComponent } from './save-dialog.component';

describe('SaveDialogComponent', () => {
    let component: SaveDialogComponent;
    let fixture: ComponentFixture<SaveDialogComponent>;

    let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<SaveDialogComponent>>;

    beforeEach(async(() => {
        matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        TestBed.configureTestingModule({
            declarations: [SaveDialogComponent],
            imports: [HttpClientTestingModule, MatDialogModule, MatSnackBarModule],
            providers: [{ provide: MatDialogRef, useValue: matDialogRefSpy }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SaveDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
