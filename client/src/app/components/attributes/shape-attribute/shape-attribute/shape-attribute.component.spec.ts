import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShapeAttributeComponent } from './shape-attribute.component';

describe('ShapeAttributeComponent', () => {
    let component: ShapeAttributeComponent;
    let fixture: ComponentFixture<ShapeAttributeComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ShapeAttributeComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ShapeAttributeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
