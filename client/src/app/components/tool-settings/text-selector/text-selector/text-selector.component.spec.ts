import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FontStyle, TextPosition, TextService } from '@app/services/tools/text/textService/text.service';
import { TextSelectorComponent } from './text-selector.component';

// tslint:disable: no-any
// tslint:disable: no-string-literal
describe('TextSelectorComponent', () => {
    let component: TextSelectorComponent;
    let fixture: ComponentFixture<TextSelectorComponent>;
    const DEFAULT_TEXT_SIZE = 1;

    let textServiceStub: TextService;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;

    const matSelectMock = {
        close(): void {
            return;
        },
    } as MatSelect;

    beforeEach(async(() => {
        textServiceStub = {
            textSize: DEFAULT_TEXT_SIZE,
            writeItalic: true,
            writeBold: false,
            textPosition: TextPosition.Center,
            fontStyle: FontStyle.Arial,
        } as TextService;

        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            declarations: [TextSelectorComponent],
            providers: [
                { provide: MatBottomSheet, useValue: {} },
                { provide: MatSnackBar, useValue: {} },
                { provide: TextService, useValue: textServiceStub },
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: MatSelect, useValue: matSelectMock },
            ],
            imports: [MatSelectModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TextSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('italic object of textEffects should call the right #setEffect method', () => {
        spyOn<any>(component, 'changeTextEffect');

        component.textEffects[0].setEffect();
        expect(component['changeTextEffect']).toHaveBeenCalledWith('italic');
    });

    it('bold object of textEffects should call the right #setEffect method', () => {
        spyOn<any>(component, 'changeTextEffect');

        component.textEffects[1].setEffect();
        expect(component['changeTextEffect']).toHaveBeenCalledWith('bold');
    });

    it('#getAttribute of textSizeSetting should return the current text size', () => {
        expect(component.textSizeSetting.getAttribute()).toEqual(DEFAULT_TEXT_SIZE);
    });

    it('#action of textSizeSetting should set the textSize', () => {
        spyOn<any>(component, 'updateText');
        const EXTECTED_TEXT_SIZE = 2;
        component.textSizeSetting.action(EXTECTED_TEXT_SIZE);
        expect(component.textService.textSize).toEqual(EXTECTED_TEXT_SIZE);
        expect(component['updateText']).toHaveBeenCalled();
    });

    it('#changeTextEffect should change the writeItalic value of textService if the textOption provided is italic', () => {
        spyOn<any>(component, 'updateText');
        component['changeTextEffect']('italic');
        expect(component.textService.writeItalic).toBeFalse();
        expect(component['updateText']).toHaveBeenCalled();
    });

    it('#changeTextEffect should change the writeBold value of textService if the textOption provided is bold', () => {
        spyOn<any>(component, 'updateText');
        component['changeTextEffect']('bold');
        expect(component.textService.writeBold).toBeTrue();
        expect(component['updateText']).toHaveBeenCalled();
    });

    it('#setActiveTextPosition should set the active text position', () => {
        const EXPECTED_TEXT_POSITION = TextPosition.Left;
        spyOn<any>(component, 'updateText');
        component.setActiveTextPosition(EXPECTED_TEXT_POSITION);
        expect(component.textService.textPosition).toEqual(EXPECTED_TEXT_POSITION);
        expect(component['updateText']).toHaveBeenCalled();
    });

    it('#checkActiveTextEffect should return the writeItalic boolean if italic string is provided', () => {
        const returnValue = component.checkActiveTextEffect('italic');
        expect(returnValue).toBeTrue();
    });

    it('#checkActiveTextEffect should return the writeBold boolean if bold string is provided', () => {
        const returnValue = component.checkActiveTextEffect('bold');
        expect(returnValue).toBeFalse();
    });

    it('#applyFontStyle should update the texte and close the matSelect', () => {
        spyOn<any>(component, 'updateText');
        spyOn(component.matSelect, 'close');
        component.applyFontStyle();
        expect(component['updateText']).toHaveBeenCalled();
        expect(component.matSelect.close).toHaveBeenCalled();
    });

    it('#updateText should update the text correctly if the boolean isWriting is set to true', () => {
        const textServiceSpy = jasmine.createSpyObj<TextService>('TextService', ['registerTextCommand', 'drawBox'], {
            isWriting: true,
        });
        component.textService = textServiceSpy;
        component['updateText']();

        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(textServiceSpy.registerTextCommand).toHaveBeenCalled();
        expect(textServiceSpy.drawBox).toHaveBeenCalled();
    });

    it('#updateText should not update the text if the boolean isWriting is set to false', () => {
        const textServiceSpy = jasmine.createSpyObj<TextService>('TextService', ['registerTextCommand', 'drawBox'], {
            isWriting: false,
        });
        component.textService = textServiceSpy;
        component['updateText']();

        expect(drawingServiceSpyObj.clearCanvas).not.toHaveBeenCalled();
        expect(textServiceSpy.registerTextCommand).not.toHaveBeenCalled();
        expect(textServiceSpy.drawBox).not.toHaveBeenCalled();
    });

    it('#onKeyDown should blur the event target if the key pressed is enter', () => {
        const keyboardEventMock: KeyboardEvent = {
            key: 'Enter',
            stopPropagation(): void {
                return;
            },
            target: {
                blur(): void {
                    return;
                },
            } as HTMLDivElement | null,
        } as KeyboardEvent;

        const stopPropagationSpy = spyOn(keyboardEventMock, 'stopPropagation');
        const blurSpy = spyOn<any>(keyboardEventMock.target as HTMLDivElement | undefined, 'blur');

        component.onKeyDown(keyboardEventMock);

        expect(stopPropagationSpy).toHaveBeenCalled();
        expect(blurSpy).toHaveBeenCalled();
    });

    it('#onKeyDown should not blur the event target if the key pressed is not enter', () => {
        const keyboardEventMock: KeyboardEvent = {
            key: 'Not enter',
            stopPropagation(): void {
                return;
            },
            target: {
                blur(): void {
                    return;
                },
            } as HTMLDivElement | null,
        } as KeyboardEvent;

        const stopPropagationSpy = spyOn(keyboardEventMock, 'stopPropagation');
        const blurSpy = spyOn<any>(keyboardEventMock.target as HTMLDivElement | undefined, 'blur');

        component.onKeyDown(keyboardEventMock);

        expect(stopPropagationSpy).toHaveBeenCalled();
        expect(blurSpy).not.toHaveBeenCalled();
    });
});
