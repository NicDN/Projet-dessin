import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { OptionBarComponent } from './option-bar.component';
import SpyObj = jasmine.SpyObj;

describe('OptionBarComponent', () => {
    let component: OptionBarComponent;
    let fixture: ComponentFixture<OptionBarComponent>;
    let drawingServiceSpy: SpyObj<DrawingService>;

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['handleNewDrawing']);

        TestBed.configureTestingModule({
            declarations: [OptionBarComponent],
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: MatDialog, useValue: {} },
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

    // it('#toggleActive should handle new drawing with the right toolTipContent', () => {
    //     const notCtrlOOption = 'This is not control O option';
    //     const ctrlOOption = 'Créer un nouveau dessin (Ctrl+O)';

    //     component.toggleActive(notCtrlOOption);
    //     expect(drawingServiceSpy.handleNewDrawing).not.toHaveBeenCalled();

    //     component.toggleActive(ctrlOOption);
    //     expect(drawingServiceSpy.handleNewDrawing).toHaveBeenCalled();
    // });
});
