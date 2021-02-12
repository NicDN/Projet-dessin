import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
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

    it('should handle new drawing', () => {
        const emptyTarget = new EventTarget();
        const ctrlOOption = 'Créer un nouveau dessin (Ctrl+O)';
        component.toggleActive(emptyTarget, ctrlOOption);
        expect(drawingServiceSpy.handleNewDrawing).toHaveBeenCalled();
    });
});
