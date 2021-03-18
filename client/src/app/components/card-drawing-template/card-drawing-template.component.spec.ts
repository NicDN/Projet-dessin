import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { CarouselService } from '@app/services/option/carousel/carousel.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { DrawingForm } from '@common/communication/drawing-form';
import { of, throwError } from 'rxjs';

import { CardDrawingTemplateComponent } from './card-drawing-template.component';

describe('CardDrawingTemplateComponent', () => {
    let component: CardDrawingTemplateComponent;
    let fixture: ComponentFixture<CardDrawingTemplateComponent>;

    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let snackbarServiceSpy: jasmine.SpyObj<SnackBarService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let carouselServiceSpy: jasmine.SpyObj<CarouselService>;

    const canvasMock = document.createElement('canvas') as HTMLCanvasElement;

    const drawingFormMock: DrawingForm = {
        id: 'id',
        name: 'test',
        tags: ['wow', 'beau', 'sexy'],
        drawingData: 'base64',
    };

    beforeEach(async(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['handleNewDrawing']);
        drawingServiceSpyObj.canvas = canvasMock;

        snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        carouselServiceSpy = jasmine.createSpyObj('CarouselService', ['deleteDrawingFromServer']);

        TestBed.configureTestingModule({
            imports: [HttpClientModule, MatSnackBarModule, RouterTestingModule],
            declarations: [CardDrawingTemplateComponent],
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: SnackBarService, useValue: snackbarServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: CarouselService, useValue: carouselServiceSpy },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CardDrawingTemplateComponent);
        component = fixture.componentInstance;
        component.drawingForm = drawingFormMock;
        // @ts-ignore
        routerSpy.url = '/editor';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#setToCurrentDrawing should change route to /editor if the current route is /home ', () => {
        const expectedImage = new Image();
        expectedImage.src = drawingFormMock.drawingData;
        // @ts-ignore
        routerSpy.url = '/home';
        spyOn(component.closeCarousel, 'emit');

        component.setToCurrentDrawing();

        expect(routerSpy.navigate).toHaveBeenCalledWith(['editor']);
        expect(drawingServiceSpyObj.newImage).toEqual(expectedImage);
        expect(component.closeCarousel.emit).toHaveBeenCalled();
    });

    it('#setToCurrentDrawing should close the carousel if #handleNewDrawing returns true', () => {
        drawingServiceSpyObj.handleNewDrawing.and.returnValue(true);
        spyOn(component.closeCarousel, 'emit');
        component.setToCurrentDrawing();
        expect(component.closeCarousel.emit).toHaveBeenCalled();
    });

    it('#setToCurrentDrawing should not close the carousel if #handleNewDrawing returns false', () => {
        drawingServiceSpyObj.handleNewDrawing.and.returnValue(false);
        spyOn(component.closeCarousel, 'emit');
        component.setToCurrentDrawing();
        expect(component.closeCarousel.emit).not.toHaveBeenCalled();
    });

    it('#deleteDrawing should delete a drawing correctly if no error occured', () => {
        carouselServiceSpy.deleteDrawingFromServer.and.returnValue(of());
        spyOn(component.requestDrawings, 'emit');

        component.deleteDrawing(drawingFormMock.id);

        expect(carouselServiceSpy.deleteDrawingFromServer).toHaveBeenCalledWith(drawingFormMock.id);
        expect(component.deletingState).toBeFalse();
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith('Le dessin a été supprimé avec succès.', 'Fermer');
        expect(component.requestDrawings.emit).toHaveBeenCalled();
    });

    it('#deleteDrawing should display a error message if a error occured', () => {
        carouselServiceSpy.deleteDrawingFromServer.and.returnValue(throwError('fake error'));
        spyOn(component.requestDrawings, 'emit');

        component.deleteDrawing(drawingFormMock.id);

        expect(carouselServiceSpy.deleteDrawingFromServer).toHaveBeenCalledWith(drawingFormMock.id);
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith('fake error', 'Fermer');
        expect(component.deletingState).toBeFalse();
        expect(component.requestDrawings.emit).toHaveBeenCalled();
    });

    it('#isTheLoadedCanvas should return false if the current route is /home', () => {
        // @ts-ignore
        routerSpy.url = '/home';
        expect(component.isTheLoadedCanvas()).toBeFalse();
    });

    it('#isTheLoadedCanvas should return false if the canvas is undefined', () => {
        // @ts-ignore
        drawingServiceSpyObj.canvas = undefined;
        expect(component.isTheLoadedCanvas()).toBeFalse();
    });

    it('#isTheLoadedCanvas should return false if the drawing of the current card is not the current drawing', () => {
        spyOn(drawingServiceSpyObj.canvas, 'toDataURL').and.returnValue('not same drawing');
        expect(component.isTheLoadedCanvas()).toBeFalse();
    });

    it('#isTheLoadedCanvas should return true if the drawing of the current card is the current drawing', () => {
        spyOn(drawingServiceSpyObj.canvas, 'toDataURL').and.returnValue('base64');
        expect(component.isTheLoadedCanvas()).toBeTrue();
    });
});
