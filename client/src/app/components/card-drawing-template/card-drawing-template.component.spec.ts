import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardDrawingTemplateComponent } from './card-drawing-template.component';

describe('CardDrawingTemplateComponent', () => {
    let component: CardDrawingTemplateComponent;
    let fixture: ComponentFixture<CardDrawingTemplateComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CardDrawingTemplateComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CardDrawingTemplateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
