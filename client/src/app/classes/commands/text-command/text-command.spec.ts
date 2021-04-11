import { TestBed } from '@angular/core/testing';
import { TextService } from '@app/services/tools/text/textService/text.service';
import { TextCommand, TextProperties } from './text-command';

// tslint:disable:no-string-literal
describe('CanvasTestHelper', () => {
    let textCommand: TextCommand;
    let textServiceSpyObj: jasmine.SpyObj<TextService>;
    const textProperties = {} as TextProperties;

    beforeEach(() => {
        textServiceSpyObj = jasmine.createSpyObj('TextService', ['drawText']);
        TestBed.configureTestingModule({
            providers: [{ provide: TextService, useValue: textServiceSpyObj }],
        });

        textCommand = new TextCommand(textServiceSpyObj, textProperties);
    });

    it('should be created', () => {
        expect(textCommand).toBeTruthy();
    });

    it('#execute should call #drawText of textService', () => {
        textCommand.execute();
        expect(textServiceSpyObj.drawText).toHaveBeenCalledWith(textProperties);
    });
});
