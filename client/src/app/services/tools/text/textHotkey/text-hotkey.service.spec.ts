import { TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TextService } from '@app/services/tools/text/textService/text.service';
import { TextHotkeyService } from './text-hotkey.service';

describe('TextHotkeyService', () => {
    let service: TextHotkeyService;
    let textServiceSpyObj: jasmine.SpyObj<TextService>;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;

    const WRITTEN_STUB = 'a bc';
    const ENTER_TABLE_STUB = [2];
    const INITIAL_WRITING_POSITION = 0;
    const THREE = 3;
    const FOUR = 4;
    const FIVE = 5;
    const SEVEN = 7;
    const SIX = 6;

    beforeEach(() => {
        textServiceSpyObj = jasmine.createSpyObj('TextService', ['changeWrittenOnPreview', 'registerTextCommand', 'drawBox'], {
            MINUS_ONE: -1,
        });
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        textServiceSpyObj.writtenOnPreview = WRITTEN_STUB;
        textServiceSpyObj.writingPosition = 0;
        textServiceSpyObj.enterPosition = ENTER_TABLE_STUB;

        TestBed.configureTestingModule({
            providers: [
                { provide: MatBottomSheet, useValue: {} },
                { provide: MatSnackBar, useValue: {} },
                { provide: TextService, useValue: textServiceSpyObj },
                { provide: DrawingService, useValue: drawingServiceSpyObj },
            ],
        });
        service = TestBed.inject(TextHotkeyService);
    });

    it('#should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#arrowLeftPressed should add one to the writing position when the value is not the length of what is written', () => {
        service.arrowLeftPressed();
        const POS_STUB = 1;
        expect(textServiceSpyObj.writingPosition).toEqual(POS_STUB);
    });

    it('#arrowLeftPressed should not add one to the writing position when the value is the length of what is written', () => {
        const POS_STUB = 4;
        textServiceSpyObj.writingPosition = POS_STUB;
        service.arrowLeftPressed();
        expect(textServiceSpyObj.writingPosition).toEqual(POS_STUB);
    });

    it('#arrowRightPressed should remove one to the writing position when the value is not 0', () => {
        const POS_STUB = 1;
        textServiceSpyObj.writingPosition = POS_STUB;
        service.arrowRightPressed();
        expect(textServiceSpyObj.writingPosition).toEqual(0);
    });

    it('#arrowRightPressed should not remove one to the writing position when the value is 0', () => {
        service.arrowRightPressed();
        expect(textServiceSpyObj.writingPosition).toEqual(0);
    });

    it('#arrowUpPressed should not affect the writting position if there is no enter', () => {
        textServiceSpyObj.enterPosition = [];
        service.arrowUpPressed();
        expect(textServiceSpyObj.writingPosition).toEqual(INITIAL_WRITING_POSITION);
    });

    it('#arrowUpPressed should not be counting enter pos lower then the writing pos', () => {
        textServiceSpyObj.writtenOnPreview = 'a b c d';
        textServiceSpyObj.enterPosition = [2, FOUR, SIX];
        textServiceSpyObj.writingPosition = FOUR;

        service.arrowUpPressed();

        expect(textServiceSpyObj.writingPosition).toEqual(SIX);
    });

    it('#arrowUpPressed should be using the index 0 when the closest enter is on the first row', () => {
        const POS_STUB = 3;
        service.arrowUpPressed();
        expect(textServiceSpyObj.writingPosition).toEqual(POS_STUB);
    });

    it('#arrowUpPressed should be adding the position of the enter the when the closest enter is not on the first row', () => {
        textServiceSpyObj.writtenOnPreview = 'a bc def';
        textServiceSpyObj.enterPosition = [1, FOUR];
        const POS_STUB = 5;
        service.arrowUpPressed();
        expect(textServiceSpyObj.writingPosition).toEqual(POS_STUB);
    });

    it('arrowUpPressed should be adding the current position on the second line to allign properly', () => {
        textServiceSpyObj.writtenOnPreview = 'a bcd e';
        textServiceSpyObj.enterPosition = [2, SIX];
        service.arrowUpPressed();
        expect(textServiceSpyObj.writingPosition).toEqual(FOUR);
    });

    it('#arrowDownPressed should not be adding anything to the position if the writing position is on the last row', () => {
        service.arrowDownPressed();
        expect(textServiceSpyObj.writingPosition).toEqual(0);
    });

    it('#arrowDownPressed should prevent the writing pos to go under 0, setting to 0 if it does', () => {
        textServiceSpyObj.writtenOnPreview = 'abc de';

        textServiceSpyObj.enterPosition = [FOUR];
        textServiceSpyObj.writingPosition = THREE;

        service.arrowDownPressed();
        expect(textServiceSpyObj.writingPosition).toEqual(0);
    });

    it('#arrowDownPressed should prevent it the writing pos from skipping a row', () => {
        textServiceSpyObj.writtenOnPreview = 'abc d e';
        textServiceSpyObj.enterPosition = [FOUR, SIX];
        textServiceSpyObj.writingPosition = FOUR;

        service.arrowDownPressed();
        expect(textServiceSpyObj.writingPosition).toEqual(2);
    });

    it('#arrowDownPressed should prevent the writing pos from being under 0 when it is not on the first row', () => {
        textServiceSpyObj.writtenOnPreview = 'abc de f';
        textServiceSpyObj.enterPosition = [FOUR, SEVEN];
        textServiceSpyObj.writingPosition = 2;

        service.arrowDownPressed();
        expect(textServiceSpyObj.writingPosition).toEqual(0);
    });

    it('#arrowDownPressed should prevent the writing pos from skipping a row when it is not on the firs row', () => {
        textServiceSpyObj.writtenOnPreview = 'a bc d e';

        textServiceSpyObj.enterPosition = [2, SIX, SEVEN];
        textServiceSpyObj.writingPosition = FOUR;

        service.arrowDownPressed();
        expect(textServiceSpyObj.writingPosition).toEqual(2);
    });

    it('#arrowDownPressed should not prevent the writing pos from skipping a row when it is not on the firs row and it does not need to', () => {
        textServiceSpyObj.writtenOnPreview = 'a b cde';
        textServiceSpyObj.enterPosition = [2, FOUR];
        textServiceSpyObj.writingPosition = FOUR;

        service.arrowDownPressed();

        expect(textServiceSpyObj.writingPosition).toEqual(2);
    });

    it('#deletePressed should not do anything when the writing pos is 0', () => {
        service.deletePressed();
        expect(textServiceSpyObj.changeWrittenOnPreview).not.toHaveBeenCalled();
    });

    it('#deletePressed should remove the deleted position from the writtenOnPreview string when it is a enter', () => {
        textServiceSpyObj.changeWrittenOnPreview.and.callFake(() => {
            textServiceSpyObj.writtenOnPreview = 'ab c';
        });
        textServiceSpyObj.writtenOnPreview = 'a b c';
        textServiceSpyObj.enterPosition = [2, FOUR];
        textServiceSpyObj.writingPosition = FOUR;
        service.deletePressed();

        expect(textServiceSpyObj.changeWrittenOnPreview).toHaveBeenCalled();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(textServiceSpyObj.registerTextCommand).toHaveBeenCalled();
        expect(textServiceSpyObj.drawBox).toHaveBeenCalled();
        expect(textServiceSpyObj.enterPosition).toEqual([THREE]);
        expect(textServiceSpyObj.writingPosition).toEqual(THREE);
        expect(textServiceSpyObj.writtenOnPreview).toEqual('ab c');
    });

    it('#deletePressed should remove the deleted position from the writtenOnPreview string', () => {
        textServiceSpyObj.changeWrittenOnPreview.and.callFake(() => {
            textServiceSpyObj.writtenOnPreview = 'a b';
        });
        textServiceSpyObj.writingPosition = 1;
        service.deletePressed();

        expect(textServiceSpyObj.changeWrittenOnPreview).toHaveBeenCalled();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(textServiceSpyObj.registerTextCommand).toHaveBeenCalled();
        expect(textServiceSpyObj.drawBox).toHaveBeenCalled();
        expect(textServiceSpyObj.enterPosition).toEqual([2]);
        expect(textServiceSpyObj.writingPosition).toEqual(0);
        expect(textServiceSpyObj.writtenOnPreview).toEqual('a b');
    });

    it('#backSpacePressed should remove the deleted position from the writtenOnPreview string', () => {
        textServiceSpyObj.changeWrittenOnPreview.and.callFake(() => {
            textServiceSpyObj.writtenOnPreview = 'a b';
        });
        service.backSpacePressed();

        expect(textServiceSpyObj.changeWrittenOnPreview).toHaveBeenCalled();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(textServiceSpyObj.registerTextCommand).toHaveBeenCalled();
        expect(textServiceSpyObj.drawBox).toHaveBeenCalled();
        expect(textServiceSpyObj.enterPosition).toEqual([2]);
        expect(textServiceSpyObj.writingPosition).toEqual(0);
        expect(textServiceSpyObj.writtenOnPreview).toEqual('a b');
    });

    it('#backSpacePressed should not do anything on the written on preview string when the writing position is at the start of the string', () => {
        textServiceSpyObj.writingPosition = FOUR;
        service.backSpacePressed();
        expect(textServiceSpyObj.changeWrittenOnPreview).not.toHaveBeenCalled();
    });

    it('#backSpacePressed should remove the deleted position from the writtenOnPreview string', () => {
        textServiceSpyObj.changeWrittenOnPreview.and.callFake(() => {
            textServiceSpyObj.writtenOnPreview = 'ab c';
        });
        textServiceSpyObj.writtenOnPreview = 'a b c';
        textServiceSpyObj.enterPosition = [2, FOUR];
        textServiceSpyObj.writingPosition = THREE;
        service.backSpacePressed();

        expect(textServiceSpyObj.changeWrittenOnPreview).toHaveBeenCalled();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalled();
        expect(textServiceSpyObj.registerTextCommand).toHaveBeenCalled();
        expect(textServiceSpyObj.drawBox).toHaveBeenCalled();
        expect(textServiceSpyObj.enterPosition).toEqual([THREE]);
        expect(textServiceSpyObj.writingPosition).toEqual(THREE);
        expect(textServiceSpyObj.writtenOnPreview).toEqual('ab c');
    });

    it('#enterPressed should add the enter into the written on preview string and in the table', () => {
        textServiceSpyObj.changeWrittenOnPreview.and.callFake(() => {
            textServiceSpyObj.writtenOnPreview = 'a  b c';
        });
        textServiceSpyObj.writtenOnPreview = 'a b c';
        textServiceSpyObj.enterPosition = [2, FOUR];
        textServiceSpyObj.writingPosition = FOUR;
        service.enterPressed();
        expect(textServiceSpyObj.enterPosition).toEqual([2, THREE, FIVE]);
        expect(textServiceSpyObj.changeWrittenOnPreview).toHaveBeenCalled();
        expect(textServiceSpyObj.writtenOnPreview).toEqual('a  b c');
    });
});
