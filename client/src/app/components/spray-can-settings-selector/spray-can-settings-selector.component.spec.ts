import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SprayCanSettingsSelectorComponent } from './spray-can-settings-selector.component';

describe('SprayCanSettingsSelectorComponent', () => {
  let component: SprayCanSettingsSelectorComponent;
  let fixture: ComponentFixture<SprayCanSettingsSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SprayCanSettingsSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SprayCanSettingsSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
