import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StampLibraryBottomSheetComponent } from './stamp-library-bottom-sheet.component';

describe('StampLibraryBottomSheetComponent', () => {
  let component: StampLibraryBottomSheetComponent;
  let fixture: ComponentFixture<StampLibraryBottomSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StampLibraryBottomSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StampLibraryBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
