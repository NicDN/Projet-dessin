import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PencilAttributeComponent } from './pencil-attribute.component';

describe('PencilAttributeComponent', () => {
  let component: PencilAttributeComponent;
  let fixture: ComponentFixture<PencilAttributeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PencilAttributeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PencilAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
