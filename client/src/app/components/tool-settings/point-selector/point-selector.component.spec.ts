import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PointSelectorComponent } from './point-selector.component';

describe('PointSelectorComponent', () => {
  let component: PointSelectorComponent;
  let fixture: ComponentFixture<PointSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PointSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
