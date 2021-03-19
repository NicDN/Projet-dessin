import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SaveService } from '@app/services/option/save/save.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { Subject, throwError } from 'rxjs';

import { SaveDialogComponent } from './save-dialog.component';

// tslint:disable: no-string-literal
describe('SaveDialogComponent', () => {
    let component: SaveDialogComponent;
    let fixture: ComponentFixture<SaveDialogComponent>;

    let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<SaveDialogComponent>>;
    let snackbarServiceSpy: jasmine.SpyObj<SnackBarService>;
    let saveServiceSpy: jasmine.SpyObj<SaveService>;

    const input = document.createElement('input');
    const FILE_NAME = 'test name';
    const TAGS_MOCK: string[] = ['one', 'two', 'three', 'four', 'five', 'six'];

    beforeEach(async(() => {
        matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

        saveServiceSpy = jasmine.createSpyObj('SaveService', ['postDrawing']);

        TestBed.configureTestingModule({
            declarations: [SaveDialogComponent],
            imports: [HttpClientTestingModule, MatDialogModule, MatSnackBarModule],
            providers: [
                { provide: MatDialogRef, useValue: matDialogRefSpy },
                { provide: SnackBarService, useValue: snackbarServiceSpy },
                { provide: SaveService, useValue: saveServiceSpy },
            ],
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

    it('#postDrawing should save a drawing correctly if no error occured', () => {
        let subject: Subject<void> = new Subject();
        saveServiceSpy.postDrawing.and.returnValue(subject);

        component.postDrawing(FILE_NAME);
        subject.next();
        expect(saveServiceSpy.postDrawing).toHaveBeenCalledWith(FILE_NAME, TAGS_MOCK);
        expect(component.savingState).toBe(false);
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith('Le dessin a été sauvegardé avec succès.', 'Fermer');
        expect(matDialogRefSpy.close).toHaveBeenCalled();
    });

    it('#postDrawing should display error message if the drawing could not be saved', () => {
        saveServiceSpy.postDrawing.and.returnValue(throwError('fake error'));

        component.postDrawing(FILE_NAME);
        expect(saveServiceSpy.postDrawing).toHaveBeenCalledWith(FILE_NAME, TAGS_MOCK);
        expect(component.savingState).toBe(false);
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith('fake error', 'Fermer');
    });

    it('#removeTag should remove a tag correctly if the tag to be removed is in the array of tags', () => {
        const TAG_TWO = 'two';
        const EXPECTED_TAGS = ['one', 'three', 'four', 'five', 'six'];
        component.tags = ['one', 'two', 'three', 'four', 'five', 'six'];
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
        const EXPECTED_TAGS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];
        component.addTag(matChipInputEvent);
        expect(component.tags).toEqual(EXPECTED_TAGS);
        expect(input.value).toBe('');
    });

    it('#addTag should not add a tag if the tag does not respect the input rules', () => {
        component.tagFormControl.setErrors({ invalid: true });
        expect(component.tagFormControl.invalid).toBeTrue();
        const matChipInputEvent: MatChipInputEvent = { input, value: 'invalid' };
        component.addTag(matChipInputEvent);
        expect(component.tags).toEqual(TAGS_MOCK);
    });

    it('#addTag should not add a tag if the tag is made of spaces', () => {
        const matChipInputEvent: MatChipInputEvent = { input, value: '' };
        component.addTag(matChipInputEvent);
        expect(component.tags).toEqual(TAGS_MOCK);
    });

    it('#clearTags should empty the array of tags', () => {
        const EMPTY_ARRAY: string[] = [];
        component.clearTags();
        expect(component.tags).toEqual(EMPTY_ARRAY);
    });

    it('#uniqueTagValidator should validate that a input tag is unique', () => {
        // case 1: non unique tag
        const NON_UNIQUE_TAG = 'three'; // three already exists in TAGS_MOCK
        const incorrectForm: FormControl = new FormControl(NON_UNIQUE_TAG);
        expect(component['uniqueTagValidator'](incorrectForm)).toEqual({
            nonUniqueTagFound: true,
        });
        expect(component.uniqueTagError).toBeTrue();

        // case 2: unique tag
        const UNIQUE_TAG = 'unique'; // 'unique' does not exists in TAGS_MOCK
        const correctForm: FormControl = new FormControl(UNIQUE_TAG);
        expect(component['uniqueTagValidator'](correctForm)).toEqual(null);
        expect(component.uniqueTagError).toBeFalse();
    });
});
