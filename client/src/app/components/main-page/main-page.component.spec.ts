import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EditorComponent } from '@app/components/editor/editor.component';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { IndexService } from '@app/services/index/index.service';
import { of } from 'rxjs';
import { MainPageComponent } from './main-page.component';
import SpyObj = jasmine.SpyObj;

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let indexServiceSpy: SpyObj<IndexService>;
    let hotKeyServiceSpy: SpyObj<HotkeyService>;

    beforeEach(async(() => {
        indexServiceSpy = jasmine.createSpyObj('IndexService', ['basicGet', 'basicPost']);
        indexServiceSpy.basicGet.and.returnValue(of({ title: '', body: '' }));
        indexServiceSpy.basicPost.and.returnValue(of());

        hotKeyServiceSpy = jasmine.createSpyObj('HotKeyService', ['onKeyDown']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'editor', component: EditorComponent }]), HttpClientModule],
            declarations: [MainPageComponent],
            providers: [
                { provide: IndexService, useValue: indexServiceSpy },
                { provide: HotkeyService, useValue: hotKeyServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
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

    it("should have as title 'LOG2990'", () => {
        expect(component.title).toEqual('LOG2990');
    });

    it('should call basicGet when calling getMessagesFromServer', () => {
        component.getMessagesFromServer();
        expect(indexServiceSpy.basicGet).toHaveBeenCalled();
    });

    it('should call basicPost when calling sendTimeToServer', () => {
        component.sendTimeToServer();
        expect(indexServiceSpy.basicPost).toHaveBeenCalled();
    });

    it('should call onKeyDown of hotkeyservice when a key is pressed', () => {
        const keyEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: false });
        window.dispatchEvent(keyEvent);
        expect(hotKeyServiceSpy.onKeyDown).toHaveBeenCalled();
    });
});
