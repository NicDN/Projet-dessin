import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericSliderComponent } from './generic-slider.component';

describe('GenericSliderComponent', () => {
  let component: GenericSliderComponent;
  let fixture: ComponentFixture<GenericSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
