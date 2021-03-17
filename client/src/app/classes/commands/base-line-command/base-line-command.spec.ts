import { TestBed } from '@angular/core/testing';
import { BaseLineCommand } from '@app/classes/commands/base-line-command/base-line-command';
import { DrawingService } from '@app/services/drawing/drawing.service';
fdescribe('base-line-command', () => {
    let baseLineCommand: BaseLineCommand;
    let drawingServiceSpyObj: DrawingService;

    const canvasStub: HTMLCanvasElement = document.createElement('canvas');
    const stubWidthAndHeight = 100;
    canvasStub.width = stubWidthAndHeight;
    canvasStub.height = stubWidthAndHeight;

    const baseImage = new Image(canvasStub.width, canvasStub.height);
    baseImage.src = canvasStub.toDataURL();

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['executeBaseLine', 'sendNotifToResize']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpyObj }],
        });
        baseLineCommand = new BaseLineCommand(drawingServiceSpyObj, baseImage);
    });

    it('#execute should call executeBaseLine', () => {
        baseLineCommand.execute();

        expect(drawingServiceSpyObj.executeBaseLine).toHaveBeenCalledWith(baseImage);
    });
});
