import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CarouselService } from '@app/services/option/carousel/carousel.service';
import { DrawingForm } from '@common/communication/drawing-form';
import { of, throwError } from 'rxjs';

import { CarouselDialogComponent } from './carousel-dialog.component';

// tslint:disable: no-string-literal
describe('CarouselDialogComponent', () => {
    let component: CarouselDialogComponent;
    let fixture: ComponentFixture<CarouselDialogComponent>;

    let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<CarouselDialogComponent>>;
    let snackbarSpy: jasmine.SpyObj<MatSnackBar>;
    let carouselServiceSpy: jasmine.SpyObj<CarouselService>;

    const input = document.createElement('input');
    let EXPECTED_INDEX: number;
    const TAGS_MOCK: string[] = ['one', 'two', 'three', 'four', 'five', 'six'];
    let keyboardEvent: KeyboardEvent;

    const drawingsMock: DrawingForm[] = [
        { id: '1', name: 'drawingOne', tags: TAGS_MOCK, drawingData: 'base64' },
        { id: '2', name: 'drawingTwo', tags: TAGS_MOCK, drawingData: 'base64' },
        { id: '3', name: 'drawingThree', tags: TAGS_MOCK, drawingData: 'base64' },
    ];

    beforeEach(async(() => {
        matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        snackbarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        carouselServiceSpy = jasmine.createSpyObj('CarouselService', ['requestDrawingsFromServer']);

        TestBed.configureTestingModule({
            declarations: [CarouselDialogComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule],
            providers: [
                { provide: MatDialogRef, useValue: matDialogRefSpy },
                { provide: MatSnackBar, useValue: snackbarSpy },
                { provide: CarouselService, useValue: carouselServiceSpy },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CarouselDialogComponent);
        component = fixture.componentInstance;
        component['startIndex'] = 0;
        component.searchedTags = TAGS_MOCK;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#ngOnInit should call #requestDrawings', () => {
        spyOn(component, 'requestDrawings');
        component.ngOnInit();
        expect(component.requestDrawings).toHaveBeenCalled();
    });

    it('#requestDrawings should request drawings correctly if no error occured', () => {
        carouselServiceSpy.requestDrawingsFromServer.and.returnValue(of(drawingsMock));

        // tslint:disable-next-line: no-any
        spyOn<any>(component, 'validateFilter');
        component.requestDrawings();
        expect(carouselServiceSpy.requestDrawingsFromServer).toHaveBeenCalled();
        expect(component.loading).toBeFalse();
        expect(component.drawings).toBe(drawingsMock);
        expect(component['validateFilter']).toHaveBeenCalled();
    });

    it('#requestDrawings should display error message if a error occured', () => {
        carouselServiceSpy.requestDrawingsFromServer.and.returnValue(throwError('fake error'));

        // tslint:disable-next-line: no-any
        spyOn<any>(component, 'openSnackBar');
        component.requestDrawings();
        expect(carouselServiceSpy.requestDrawingsFromServer).toHaveBeenCalled();
        expect(component['openSnackBar']).toHaveBeenCalledWith('fake error', 'Fermer');
        expect(component.loading).toBeFalse();
    });

    it('#forwardDrawings should update de carousel corectly', () => {
        EXPECTED_INDEX = 1;
        spyOn(component, 'requestDrawings');
        component.forwardDrawings();
        expect(component['startIndex']).toEqual(EXPECTED_INDEX);
        expect(component.requestDrawings).toHaveBeenCalled();
    });

    it('#backwardDrawings should update de carousel corectly', () => {
        // tslint:disable-next-line: no-magic-numbers
        EXPECTED_INDEX = -1;
        spyOn(component, 'requestDrawings');
        component.backwardDrawings();
        expect(component['startIndex']).toEqual(EXPECTED_INDEX);
        expect(component.requestDrawings).toHaveBeenCalled();
    });

    it('#validateFilter removes the error state of the filter form field if there is no tag to filter', () => {
        component.searchedTags = [];
        component.chipList.errorState = true;
        component['validateFilter']();
        expect(component.chipList.errorState).toBeFalse();
    });

    it('#validateFilter removes the error state of the filter form field there are filtered drawings displayed', () => {
        component.searchedTags.length = 1; // filter with one tag
        component.drawings.length = 1; // one drawing filtered is displayed
        component.chipList.errorState = true;
        component['validateFilter']();
        expect(component.chipList.errorState).toBeFalse();
    });

    it('#validateFilter removes the error state of the filter form field if there are no filtered drawings to dislay', () => {
        component.searchedTags.length = 1; // filter with one tag
        component.drawings.length = 0; // no drawing filtered is displayed
        component.chipList.errorState = false;
        component['validateFilter']();
        expect(component.chipList.errorState).toBeTrue();
    });

    it('#removeTag should remove a tag correctly if the tag to be removed is in the array of tags', () => {
        // TODO: sometimes 'seven' from the addTag test is in the Array !
        const TAG_TWO = 'two';
        const EXPECTED_TAGS = ['one', 'three', 'four', 'five', 'six'];

        spyOn(component, 'requestDrawings');
        component.removeTag(TAG_TWO);
        expect(component.searchedTags).toEqual(EXPECTED_TAGS);
        expect(component.requestDrawings).toHaveBeenCalled();
    });

    it('#removeTag should not remove a tag if the tag to be removed is not in the array of tags', () => {
        const MISSING_TAG = 'missing';
        component.removeTag(MISSING_TAG);
        expect(component.searchedTags).toEqual(TAGS_MOCK);
    });

    it('#addTag should add a tag correclty', () => {
        const matChipInputEvent: MatChipInputEvent = { input, value: 'seven' };
        TAGS_MOCK.push(matChipInputEvent.value);
        const EXPECTED_TAGS = TAGS_MOCK;
        spyOn(component, 'requestDrawings');
        component.addTag(matChipInputEvent);
        expect(component.searchedTags).toBe(EXPECTED_TAGS);
        expect(component.requestDrawings).toHaveBeenCalled();
        expect(input.value).toBe('');
    });

    it('#addTag should not add a tag if the tag is made of spaces', () => {
        const matChipInputEvent: MatChipInputEvent = { input, value: '' };
        component.addTag(matChipInputEvent);
        expect(component.searchedTags).toEqual(TAGS_MOCK);
    });

    it('#onKeyDown should call #backwardDrawings if the left arrow key is pressed', () => {
        keyboardEvent = { key: 'ArrowLeft' } as KeyboardEvent;
        spyOn(component, 'backwardDrawings');
        component.onKeyDown(keyboardEvent);
        expect(component.backwardDrawings).toHaveBeenCalled();
    });

    it('#onKeyDown should call #forwardDrawings if the right arrow key is pressed', () => {
        keyboardEvent = { key: 'ArrowRight' } as KeyboardEvent;
        spyOn(component, 'forwardDrawings');
        component.onKeyDown(keyboardEvent);
        expect(component.forwardDrawings).toHaveBeenCalled();
    });

    it('#closeDialog should close the dialog correctly', () => {
        component.closeDialog();
        expect(matDialogRefSpy.close).toHaveBeenCalled();
    });

    it('#clearSearchedTags should clear searched tags correctly ', () => {
        const EMPTY_ARRAY: string[] = [];
        spyOn(component, 'requestDrawings');
        component.clearSearchedTags();
        expect(component.searchedTags).toEqual(EMPTY_ARRAY);
        expect(component.requestDrawings).toHaveBeenCalled();
    });

    it('#openSnackBar should open the snack bar correctly', () => {
        component['openSnackBar']('test', 'close');
        expect(snackbarSpy.open).toHaveBeenCalled();
    });
});
