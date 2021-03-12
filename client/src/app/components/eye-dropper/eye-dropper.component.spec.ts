import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EyeDropperComponent } from './eye-dropper.component';

describe('EyeDropperComponent', () => {
    let component: EyeDropperComponent;
    let fixture: ComponentFixture<EyeDropperComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EyeDropperComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EyeDropperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
