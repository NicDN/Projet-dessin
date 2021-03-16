import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Shape, TraceType } from '@app/classes/shape';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { ShapeService } from '@app/services/tools/shape/shape.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { TraceTypeSelectorComponent } from './trace-type-selector.component';

describe('TraceTypeSelectorComponent', () => {
    let component: TraceTypeSelectorComponent;
    let fixture: ComponentFixture<TraceTypeSelectorComponent>;
    const shape: Shape = new RectangleDrawingService(
        new DrawingService(),
        new ColorService(),
        new UndoRedoService(new DrawingService()),
        new ShapeService(),
    );

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TraceTypeSelectorComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TraceTypeSelectorComponent);
        component = fixture.componentInstance;
        component.tool = shape;

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
});
