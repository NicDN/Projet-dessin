import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselDialogComponent } from './carousel-dialog.component';

describe('CarouselDialogComponent', () => {
  let component: CarouselDialogComponent;
  let fixture: ComponentFixture<CarouselDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarouselDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarouselDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
