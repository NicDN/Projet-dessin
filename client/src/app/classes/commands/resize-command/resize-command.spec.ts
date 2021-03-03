import { TestBed } from '@angular/core/testing';
import { BoxSize } from '@app/classes/box-size';
import { ResizeCommand } from '@app/classes/commands/resize-command/resize-command';
import { DrawingService } from '@app/services/drawing/drawing.service';
describe('ResizeCommand', () => {
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    const boxSize: BoxSize = { widthBox: 1, heightBox: 1 };
    let resizeCommand: ResizeCommand;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['sendNotifToResize']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpyObj }],
        });
        resizeCommand = new ResizeCommand(boxSize, drawingServiceSpyObj);
    });

    it('#execute should send a notification to drawing service', () => {
        resizeCommand.execute();
        expect(drawingServiceSpyObj.sendNotifToResize).toHaveBeenCalled();
    });
});
