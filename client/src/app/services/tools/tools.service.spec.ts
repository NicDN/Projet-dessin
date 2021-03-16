import { TestBed } from '@angular/core/testing';
import { Tool } from '@app/classes/tool';
import { Subject } from 'rxjs';
import { PencilService } from './drawing-tool/pencil/pencil.service';
import { EllipseDrawingService } from './shape/ellipse/ellipse-drawing.service';
import { ToolsService } from './tools.service';

// tslint:disable: no-string-literal
describe('ToolsService', () => {
    let service: ToolsService;
    let pencilService: PencilService;
    let ellipseDrawingService: EllipseDrawingService;
    const keyboardEvent = new KeyboardEvent('test');

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [PencilService, EllipseDrawingService] });
        service = TestBed.inject(ToolsService);
        pencilService = TestBed.inject(PencilService);
        ellipseDrawingService = TestBed.inject(EllipseDrawingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set initial current tool to pencil', () => {
        expect(service.currentTool).toBe(pencilService);
    });

    it('#setCurrentTool should update the provided current tool and call its subscribers', () => {
        spyOn(service['subject'], 'next');
        spyOn(service.lineService, 'clearPath');
        spyOn(service.lineService, 'updatePreview');
        service.setCurrentTool(ellipseDrawingService);
        expect(service.currentTool).toBe(ellipseDrawingService);
        expect(service['subject'].next).toHaveBeenCalled();
        expect(service['subject'].next).toHaveBeenCalledWith(ellipseDrawingService);
        expect(service.lineService.clearPath).not.toHaveBeenCalledWith();
        expect(service.lineService.updatePreview).not.toHaveBeenCalledWith();
    });

    it('#setCurrentTool should update the provided current tool and call its subscribers and reset lineService', () => {
        service.currentTool = service.lineService;
        spyOn(service['subject'], 'next');
        spyOn(service.lineService, 'clearPath');
        spyOn(service.lineService, 'updatePreview');
        service.setCurrentTool(ellipseDrawingService);
        expect(service.currentTool).toBe(ellipseDrawingService);
        expect(service['subject'].next).toHaveBeenCalled();
        expect(service['subject'].next).toHaveBeenCalledWith(ellipseDrawingService);
        expect(service.lineService.clearPath).toHaveBeenCalledWith();
        expect(service.lineService.updatePreview).toHaveBeenCalledWith();
    });

    it('#getCurrentTool should return an observable subject', () => {
        const expectedSubject: Subject<Tool> = new Subject<Tool>();
        service['subject'] = expectedSubject;
        expect(service.getCurrentTool()).toEqual(expectedSubject.asObservable());
    });

    it("#onKeyDown should call the current tool's #onKeyDown", () => {
        spyOn(service.currentTool, 'onKeyDown');
        service.onKeyDown(keyboardEvent);
        expect(service.currentTool.onKeyDown).toHaveBeenCalled();
        expect(service.currentTool.onKeyDown).toHaveBeenCalledWith(keyboardEvent);
    });

    it("#onKeyUp should call the current tool's #onKeyUp", () => {
        spyOn(service.currentTool, 'onKeyUp');
        service.onKeyUp(keyboardEvent);
        expect(service.currentTool.onKeyUp).toHaveBeenCalled();
        expect(service.currentTool.onKeyUp).toHaveBeenCalledWith(keyboardEvent);
    });
});
