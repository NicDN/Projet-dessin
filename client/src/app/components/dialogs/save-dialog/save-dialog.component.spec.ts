import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { SaveDialogComponent } from './save-dialog.component';

fdescribe('SaveDialogComponent', () => {
    let component: SaveDialogComponent;
    let fixture: ComponentFixture<SaveDialogComponent>;
    let input = document.createElement('input');

    let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<SaveDialogComponent>>;

    const TAGS_MOCK: string[] = ['one', 'two', 'three', 'four', 'five', 'six'];

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
        component.tags = TAGS_MOCK;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#removeTag should remove a tag correctly if the tag to be removed is in the array of tags', () => {
        // TODO: sometimes the test contains 'invalid' string from another test!
        const TAG_TWO = 'two';
        const EXPECTED_TAGS = ['one', 'three', 'four', 'five', 'six'];
        component.removeTag(TAG_TWO);
        expect(component.tags).toEqual(EXPECTED_TAGS);
    });

    it('#removeTag should not remove a tag if the tag to be removed is not in the array of tags', () => {
        const MISSING_TAG = 'missing';
        component.removeTag(MISSING_TAG);
        expect(component.tags).toEqual(TAGS_MOCK);
    });

    it('#addTag should add a tag correclty', () => {
        const matChipInputEvent: MatChipInputEvent = { input, value: 'seven' };
        const EXPECTED_TAGS = ['one', 'three', 'four', 'five', 'six', 'seven'];
        component.addTag(matChipInputEvent);
        expect(component.tags).toEqual(EXPECTED_TAGS);
    });

    it('#addTag should not add a tag if the tag does not respect the input rules', () => {
        const CONTROL: FormControl = new FormControl();
        CONTROL.setErrors({ invalid: true });
        const matChipInputEvent: MatChipInputEvent = { input, value: 'invalid' };
        component.addTag(matChipInputEvent);
        expect(component.tags).toEqual(TAGS_MOCK);
    });

    it('#clearTags should empty the array of tags', () => {
        const EMPTY_ARRAY: string[] = [];
        component.clearTags();
        expect(component.tags).toEqual(EMPTY_ARRAY);
    });
});
