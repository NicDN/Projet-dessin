import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Shape, TraceType } from '@app/classes/shape';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleDrawingService } from '@app/services/tools/shape/rectangle/rectangle-drawing.service';
import { TraceTypeSelectorComponent } from './trace-type-selector.component';

describe('TraceTypeSelectorComponent', () => {
    let component: TraceTypeSelectorComponent;
    let fixture: ComponentFixture<TraceTypeSelectorComponent>;
    const shape: Shape = new RectangleDrawingService(new DrawingService(), new ColorService());

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TraceTypeSelectorComponent],
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

    it('should raise updateTraceTypeEmitter event when #setActiveTraceType is called', () => {
        const traceTypeExpected: TraceType = TraceType.Bordered;
        let traceTypeEmittedValue: TraceType = TraceType.FilledAndBordered;
        // I give a arbitrary value to  traceTypeEmittedValue only to avoid error:
        // Variable 'traceTypeEmittedValue' is used before being assigned.ts(2454)
        component.updateTraceTypeEmitter.subscribe((traceType: TraceType) => {
            traceTypeEmittedValue = traceType;
        });
        component.setActiveTraceType(traceTypeExpected);
        expect(traceTypeEmittedValue as TraceType).toBe(traceTypeExpected);
    });
});
