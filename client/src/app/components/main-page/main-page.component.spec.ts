import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EditorComponent } from '@app/components/editor/editor.component';
import { DialogService } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { LocalStorageService } from '@app/services/local-storage/local-storage.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { MainPageComponent } from './main-page.component';

// tslint:disable: no-string-literal
describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let hotKeyServiceSpy: jasmine.SpyObj<HotkeyService>;
    let dialogServiceSpyObj: jasmine.SpyObj<DialogService>;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let imageSpyObj: jasmine.SpyObj<HTMLImageElement>;
    let localStorageSpyObj: jasmine.SpyObj<LocalStorageService>;

    beforeEach(async(() => {
        hotKeyServiceSpy = jasmine.createSpyObj('HotKeyService', ['onKeyDown']);
        dialogServiceSpyObj = jasmine.createSpyObj('DialogService', ['openDialog']);
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['changeDrawing', 'confirmReload']);
        imageSpyObj = jasmine.createSpyObj('Image', ['decode']);
        localStorageSpyObj = jasmine.createSpyObj('LocalStorageService', ['confirmNewDrawing', 'storageIsEmpty']);

        spyOn(window, 'Image').and.returnValue(imageSpyObj);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'editor', component: EditorComponent }]), HttpClientModule],
            declarations: [MainPageComponent],
            providers: [
                { provide: HotkeyService, useValue: hotKeyServiceSpy },
                { provide: DialogService, useValue: dialogServiceSpyObj },
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: SnackBarService, useValue: {} },
                { provide: LocalStorageService, useValue: localStorageSpyObj },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        const INCREASED_TIMEOUT_INTERVAL = 150000;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = INCREASED_TIMEOUT_INTERVAL;
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

    it('#createNewDrawing should navigate to editor page if the user confirms to create new drawing', async(async () => {
        // const localSpyObj = jasmine.createSpyObj<LocalStorageService>('LocalStorageService', ['confirmNewDrawing']);
        // localSpyObj.confirmNewDrawing.and.resolveTo(true);

        // component['localStorageService'] = localSpyObj;
        localStorageSpyObj.confirmNewDrawing.and.resolveTo(true);

        component['drawingService'] = { isNewDrawing: false } as DrawingService;
        spyOn(component['router'], 'navigate');

        await component.createNewDrawing();

        expect(component['router'].navigate).toHaveBeenCalledWith(['editor']);
        expect(component['drawingService'].isNewDrawing).toBeTrue();
    }));

    it('#createNewDrawing should not navigate to editor page if the user does not confirm to create new drawing', async(async () => {
        // const localSpyObj = jasmine.createSpyObj<LocalStorageService>('LocalStorageService', ['confirmNewDrawing']);
        // localSpyObj.confirmNewDrawing.and.resolveTo(false);

        // component['localStorageService'] = localSpyObj;

        localStorageSpyObj.confirmNewDrawing.and.resolveTo(false);

        component['drawingService'] = { isNewDrawing: false } as DrawingService;
        spyOn(component['router'], 'navigate');

        await component.createNewDrawing();

        expect(component['router'].navigate).not.toHaveBeenCalled();
        expect(component['drawingService'].isNewDrawing).toBeFalse();
    }));

    it('#continueDrawing should put the saved drawing on the canvas correctly', async () => {
        const canvasMock = document.createElement('canvas');
        spyOn(localStorage, 'getItem').and.returnValue(canvasMock.toDataURL());

        await component.continueDrawing();

        expect(imageSpyObj.decode).toHaveBeenCalled();
        expect(drawingServiceSpyObj.changeDrawing).toHaveBeenCalled();
    });
});
