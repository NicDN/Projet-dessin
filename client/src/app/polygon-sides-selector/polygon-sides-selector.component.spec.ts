import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolygonSidesSelectorComponent } from './polygon-sides-selector.component';

describe('PolygonSidesSelectorComponent', () => {
  let component: PolygonSidesSelectorComponent;
  let fixture: ComponentFixture<PolygonSidesSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolygonSidesSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolygonSidesSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
