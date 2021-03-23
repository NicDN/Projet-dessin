import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { SprayCanService } from '@app/services/tools/spray-can/spray-can.service';
import { RandomStoring, SprayCanCommand, SprayCanPropreties } from './spray-can-command';

// tslint:disable: no-string-literal
describe('spray-can-command', () => {
    let sprayCanServiceSpyObj: jasmine.SpyObj<SprayCanService>;
    let sprayCanCommand: SprayCanCommand;
    let sprayCanPropreties: SprayCanPropreties;
    let canvasStub: CanvasTestHelper;
    let canvasStubCtx: CanvasRenderingContext2D;

    const pathStubProperties: Vec2[] = [{ x: 0, y: 0 }];
    const randomArrayStub: number[] = [0, 0];
    const randomArrayStub2: number[][] = [randomArrayStub, randomArrayStub];
    const randomArrayStub3: number[][] = [randomArrayStub, randomArrayStub, randomArrayStub];

    const storingStub: RandomStoring = {
        angleArray: randomArrayStub2,
        radiusArray: randomArrayStub2,
    };

    const storingStub3: RandomStoring = {
        angleArray: randomArrayStub3,
        radiusArray: randomArrayStub3,
    };

    const numberStub = 1;
    const MAIN_COLOR: Color = { rgbValue: 'red', opacity: 1 };

    beforeEach(() => {
        sprayCanServiceSpyObj = jasmine.createSpyObj(SprayCanService, ['sprayOnCanvas']);
        TestBed.configureTestingModule({
            providers: [{ provide: SprayCanService, useValue: sprayCanServiceSpyObj }],
        });

        canvasStub = TestBed.inject(CanvasTestHelper);
        canvasStubCtx = canvasStub.canvas.getContext('2d') as CanvasRenderingContext2D;

        sprayCanPropreties = {
            drawingCtx: canvasStubCtx,
            drawingPath: pathStubProperties,
            mainColor: MAIN_COLOR,
            dropletsDiameter: numberStub,
            sprayDiameter: numberStub,
            emissionRate: numberStub,
            angleArray: randomArrayStub,
            radiusArray: randomArrayStub,
            randomStoring: storingStub,
        };
        sprayCanCommand = new SprayCanCommand(sprayCanServiceSpyObj, sprayCanPropreties);
    });

    it('#execute should call the draw function from rectangle', () => {
        sprayCanCommand.executeNotUndoRedo();
        expect(sprayCanServiceSpyObj.sprayOnCanvas).toHaveBeenCalled();
    });

    it('#execute should call spray on canvas for every point there is in drawing path', () => {
        sprayCanCommand.execute();
        expect(sprayCanServiceSpyObj.sprayOnCanvas).toHaveBeenCalledTimes(sprayCanPropreties.drawingPath.length);
    });

    it('#execute should not call sprayOnCanvas if the randomStoring is undefined', () => {
        sprayCanCommand['sprayCanProprieties'].randomStoring = undefined;
        sprayCanCommand.execute();
        expect(sprayCanServiceSpyObj.sprayOnCanvas).not.toHaveBeenCalled();
    });

    it('#setRandomStoring should assign a new randomStoring interface', () => {
        sprayCanCommand.setRandomStoring(storingStub3);
        expect(sprayCanCommand['sprayCanProprieties'].randomStoring).toBe(storingStub3);
    });
});
