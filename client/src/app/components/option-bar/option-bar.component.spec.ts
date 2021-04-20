import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogService, DialogType } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { OptionBarComponent } from './option-bar.component';
import SpyObj = jasmine.SpyObj;

describe('OptionBarComponent', () => {
    let component: OptionBarComponent;
    let fixture: ComponentFixture<OptionBarComponent>;
    let drawingServiceSpy: SpyObj<DrawingService>;
    let dialogServiceSpy: SpyObj<DialogService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['handleNewDrawing']);
        dialogServiceSpy = jasmine.createSpyObj('DialogService', ['openDialog']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            declarations: [OptionBarComponent],
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: MatDialog, useValue: {} },
                { provide: DialogService, useValue: dialogServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OptionBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('OptionBarElements should call the right action when toggled', () => {
        component.optionBarElements[0].action();
        expect(drawingServiceSpy.handleNewDrawing).toHaveBeenCalled();

        component.optionBarElements[1].action();
        expect(dialogServiceSpy.openDialog).toHaveBeenCalledWith(DialogType.Save);

        component.optionBarElements[2].action();
        expect(dialogServiceSpy.openDialog).toHaveBeenCalledWith(DialogType.Export);

        // tslint:disable-next-line: no-magic-numbers
        component.optionBarElements[3].action();
        expect(dialogServiceSpy.openDialog).toHaveBeenCalledWith(DialogType.Carousel);

        // tslint:disable-next-line: no-magic-numbers
        component.optionBarElements[4].action();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['home']);
    });
});
