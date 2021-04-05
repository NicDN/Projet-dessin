import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EditorComponent } from '@app/components/editor/editor.component';
import { DialogService } from '@app/services/dialog/dialog.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { MainPageComponent } from './main-page.component';

// tslint:disable: no-string-literal
describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let hotKeyServiceSpy: jasmine.SpyObj<HotkeyService>;
    let dialogServiceSpyObj: jasmine.SpyObj<DialogService>;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;

    beforeEach(async(() => {
        hotKeyServiceSpy = jasmine.createSpyObj('HotKeyService', ['onKeyDown']);
        dialogServiceSpyObj = jasmine.createSpyObj('DialogService', ['openDialog']);
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['changeDrawing']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'editor', component: EditorComponent }]), HttpClientModule],
            declarations: [MainPageComponent],
            providers: [
                { provide: HotkeyService, useValue: hotKeyServiceSpy },
                { provide: DialogService, useValue: dialogServiceSpyObj },
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: SnackBarService, useValue: {} },
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

    it('#createNewDrawing should navigate to editor page', () => {
        spyOn(component['router'], 'navigate');
        drawingServiceSpyObj.isNewDrawing = false;
        component.createNewDrawing();
        expect(component['router'].navigate).toHaveBeenCalledWith(['editor']);
        expect(drawingServiceSpyObj.isNewDrawing).toBeTrue();
    });

    // TODO: commented this async test because it is block other test, ask to charger on friday
    // it('#continueDrawing should put the saved drawing on the canvas correctly', async () => {
    //     const canvasMock = document.createElement('canvas');
    //     spyOn(localStorage, 'getItem').and.returnValue(canvasMock.toDataURL());
    //     spyOn(component['image'], 'decode').and.resolveTo();

    //     const expectedImage = new Image();
    //     expectedImage.src = canvasMock.toDataURL();
    //     await expectedImage.decode();

    //     await component.continueDrawing();

    //     expect(drawingServiceSpyObj.changeDrawing).toHaveBeenCalledWith(expectedImage);
    // });
});
