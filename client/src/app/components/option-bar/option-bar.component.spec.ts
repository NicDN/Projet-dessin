import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { OptionBarComponent } from './option-bar.component';
import SpyObj = jasmine.SpyObj;

describe('OptionBarComponent', () => {
    let component: OptionBarComponent;
    let fixture: ComponentFixture<OptionBarComponent>;
    let drawingServiceSpy: SpyObj<DrawingService>;
    let dialogServiceSpy: SpyObj<DialogService>;

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['handleNewDrawing']);
        dialogServiceSpy = jasmine.createSpyObj('DialogService', ['openDialog']);

        TestBed.configureTestingModule({
            declarations: [OptionBarComponent],
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: MatDialog, useValue: {} },
                { provide: DialogService, useValue: dialogServiceSpy },
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
});
