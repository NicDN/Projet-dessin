import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TraceTypeSelectorComponent } from './trace-type-selector.component';

describe('TraceTypeSelectorComponent', () => {
  let component: TraceTypeSelectorComponent;
  let fixture: ComponentFixture<TraceTypeSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TraceTypeSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TraceTypeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
