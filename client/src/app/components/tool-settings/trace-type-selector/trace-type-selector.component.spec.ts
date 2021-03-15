import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Color } from '@app/classes/color';
import { Shape, TraceType } from '@app/classes/shape';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { TraceTypeSelectorComponent } from './trace-type-selector.component';

describe('TraceTypeSelectorComponent', () => {
    let component: TraceTypeSelectorComponent;
    let fixture: ComponentFixture<TraceTypeSelectorComponent>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;

    const shape: Shape = new RectangleDrawingService(new DrawingService(), new ColorService(), new UndoRedoService(new DrawingService()));

    const mainColorMock: Color = {
        rgbValue: 'main color',
    } as Color;

    const secondaryColorMock: Color = {
        rgbValue: 'secondary color',
    } as Color;

    beforeEach(async(() => {
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['']);
        TestBed.configureTestingModule({
            declarations: [TraceTypeSelectorComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [{ provide: ColorService, useValue: colorServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TraceTypeSelectorComponent);
        component = fixture.componentInstance;
        component.tool = shape;
        colorServiceSpy.mainColor = mainColorMock;
        colorServiceSpy.secondaryColor = secondaryColorMock;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('click from trace-type-button should toggle #setActiveTraceType', () => {
        spyOn(component, 'setActiveTraceType');
        const traceTypeButton = fixture.debugElement.query(By.css('.trace-type-button'));
        traceTypeButton.triggerEventHandler('click', null);
        expect(component.setActiveTraceType).toHaveBeenCalled();
    });

    it('should raise traceType event when #setActiveTraceType is called', () => {
        const traceTypeExpected: TraceType = TraceType.Bordered;
        spyOn(component.traceType, 'emit');
        component.setActiveTraceType(traceTypeExpected);
        expect(component.traceType.emit).toHaveBeenCalled();
        expect(component.traceType.emit).toHaveBeenCalledWith(traceTypeExpected);
    });

    it('#getColor should get the right color according to the toolTipContent provided', () => {
        expect(component.getColor('Contour')).toBe(colorServiceSpy.secondaryColor.rgbValue);
        expect(component.getColor('Plein')).toBe(colorServiceSpy.mainColor.rgbValue);
        expect(component.getColor('')).toBe('white');
    });
});
