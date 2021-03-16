import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DrawingForm } from '@common/communication/drawing-form';
import { CardDrawingTemplateComponent } from './card-drawing-template.component';

describe('CardDrawingTemplateComponent', () => {
    let component: CardDrawingTemplateComponent;
    let fixture: ComponentFixture<CardDrawingTemplateComponent>;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    const canvasMock = document.createElement('canvas') as HTMLCanvasElement;

    const drawingFormMock: DrawingForm = {
        id: '',
        name: 'test',
        tags: ['wow', 'beau', 'sexy'],
        drawingData: '',
    };

    beforeEach(async(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['handleNewDrawing']);
        drawingServiceSpyObj.canvas = canvasMock;

        TestBed.configureTestingModule({
            imports: [HttpClientModule, MatSnackBarModule, RouterTestingModule],
            declarations: [CardDrawingTemplateComponent],
            providers: [{ provide: DrawingService, useValue: drawingServiceSpyObj }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CardDrawingTemplateComponent);
        component = fixture.componentInstance;
        component.drawingForm = drawingFormMock;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
