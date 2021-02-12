import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
import { OptionBarComponent } from './option-bar.component';
import SpyObj = jasmine.SpyObj;

describe('OptionBarComponent', () => {
    let component: OptionBarComponent;
    let fixture: ComponentFixture<OptionBarComponent>;
    let hotKeyServiceSpy: SpyObj<HotkeyService>;
    let drawingServiceSpy: SpyObj<DrawingService>;

    beforeEach(async(() => {
        hotKeyServiceSpy = jasmine.createSpyObj('HotKeyService', ['onKeyDown']);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['handleNewDrawing']);

        TestBed.configureTestingModule({
            declarations: [OptionBarComponent],
            providers: [
                { provide: HotkeyService, useValue: hotKeyServiceSpy },
                { provide: DrawingService, useValue: drawingServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OptionBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call onKeyDown function of hotkeyservice when pressing down a key', () => {
        const keyEvent = new KeyboardEvent('keydown', { code: 'KeyO', ctrlKey: false });
        window.dispatchEvent(keyEvent);
        expect(hotKeyServiceSpy.onKeyDown).toHaveBeenCalled();
    });

    it('should handle new drawing', () => {
        const emptyTarget = new EventTarget();
        const ctrlOOption = 'Créer un nouveau dessin (Ctrl+O)';
        component.toggleActive(emptyTarget, ctrlOOption);
        expect(drawingServiceSpy.handleNewDrawing).toHaveBeenCalled();
    });
});
