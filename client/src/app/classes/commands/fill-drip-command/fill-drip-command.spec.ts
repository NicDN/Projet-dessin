import { TestBed } from '@angular/core/testing';
import { FillDripService } from '@app/services/tools/fill-drip/fill-drip.service';
import { FillDripCommand, FillDripProperties } from './fill-drip-command';

describe('FillDripCommand', () => {
    let fillDripServiceSpyObj: jasmine.SpyObj<FillDripService>;
    let fillDripCommand: FillDripCommand;

    const fillDripProperties = {} as FillDripProperties;

    beforeEach(() => {
        fillDripServiceSpyObj = jasmine.createSpyObj('FillDripService', ['contiguousFilling', 'nonContiguousFilling']);
        TestBed.configureTestingModule({
            providers: [{ provide: FillDripService, useValue: fillDripServiceSpyObj }],
        });
        fillDripCommand = new FillDripCommand(fillDripServiceSpyObj, fillDripProperties);
    });

    it('#execute should fill contiguous mode if isContigus is true', () => {
        fillDripProperties.isContiguous = true;
        fillDripCommand.execute();
        expect(fillDripServiceSpyObj.contiguousFilling).toHaveBeenCalled();
    });

    it('#execute should fill non contiguous mode if isContiguous is false', () => {
        fillDripProperties.isContiguous = false;
        fillDripCommand.execute();
        expect(fillDripServiceSpyObj.nonContiguousFilling).toHaveBeenCalled();
    });
});
