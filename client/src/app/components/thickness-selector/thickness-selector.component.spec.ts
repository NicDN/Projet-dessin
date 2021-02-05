import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThicknessSelectorComponent } from './thickness-selector.component';

describe('ThicknessSelectorComponent', () => {
    let component: ThicknessSelectorComponent;
    let fixture: ComponentFixture<ThicknessSelectorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ThicknessSelectorComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ThicknessSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
