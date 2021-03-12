import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EditorComponent } from '@app/components/editor/editor.component';
import { DialogService } from '@app/services/dialog/dialog.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { MainPageComponent } from './main-page.component';
import SpyObj = jasmine.SpyObj;

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let hotKeyServiceSpy: SpyObj<HotkeyService>;
    let dialogServiceSpyObj: jasmine.SpyObj<DialogService>;

    beforeEach(async(() => {
        hotKeyServiceSpy = jasmine.createSpyObj('HotKeyService', ['onKeyDown']);
        dialogServiceSpyObj = jasmine.createSpyObj('DialogService', ['openDialog']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'editor', component: EditorComponent }]), HttpClientModule],
            declarations: [MainPageComponent],
            providers: [
                { provide: HotkeyService, useValue: hotKeyServiceSpy },
                { provide: DialogService, useValue: dialogServiceSpyObj },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call onKeyDown of hotkeyservice when a key is pressed', () => {
        const keyEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: false });
        window.dispatchEvent(keyEvent);
        expect(hotKeyServiceSpy.onKeyDown).toHaveBeenCalled();
    });
});
