import { TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { ColorService } from './color.service';

describe('ColorService', () => {
    let service: ColorService;
    const EXPECT_SECONDARY_COLOR: Color = { rgbValue: 'rgb(255,0,0)', opacity: 1 };
    const EXPECT_MAIN_COLOR: Color = { rgbValue: 'rgb(0,0,255)', opacity: 1 };
    const DEFAULT_COLOR: Color = { rgbValue: 'rgb(1,1,1)', opacity: 1 };

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ColorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#switchColors should switch colors', () => {
        service.mainColor = { rgbValue: 'rgb(255,0,0)', opacity: 1 };
        service.secondaryColor = { rgbValue: 'rgb(0,0,255)', opacity: 1 };
        service.switchColors();

        expect(service.mainColor).toEqual(EXPECT_MAIN_COLOR);
        expect(service.secondaryColor).toEqual(EXPECT_SECONDARY_COLOR);
    });

    it('#updateSecondaryColor should update secondary color', () => {
        service.updateSecondaryColor(EXPECT_SECONDARY_COLOR);
        expect(service.secondaryColor).toEqual(EXPECT_SECONDARY_COLOR);
    });

    it('#updateMainColor should update main color', () => {
        service.updateMainColor(EXPECT_SECONDARY_COLOR);
        expect(service.secondaryColor).toEqual(EXPECT_MAIN_COLOR);
    });

    it('#updateColor should call #updateMainColor when an instance of mainColor is provided', () => {
        spyOn(service, 'updateMainColor');
        service.mainColor = DEFAULT_COLOR;
        service.updateColor(service.mainColor, DEFAULT_COLOR);
        expect(service.updateMainColor).toHaveBeenCalled();
    });

    it('#updateColor should call #updateSecondaryColor when an instance of secondaryColor is provided', () => {
        spyOn(service, 'updateSecondaryColor');
        service.secondaryColor = DEFAULT_COLOR;
        service.updateColor(service.secondaryColor, DEFAULT_COLOR);
        expect(service.updateSecondaryColor).toHaveBeenCalled();
    });

    it('#updatePreviousColors should update previous colors', () => {
        const EXPECTED_LAST_COLOR: Color = { rgbValue: 'rgb(255,128,0)', opacity: 1 };
        service.updatePreviousColors(DEFAULT_COLOR);
        expect(service.previousColors[0]).toEqual(DEFAULT_COLOR);
        expect(service.previousColors[service.previousColors.length - 1].opacity).toEqual(EXPECTED_LAST_COLOR.opacity);
        expect(service.previousColors[service.previousColors.length - 1].rgbValue).toEqual(EXPECTED_LAST_COLOR.rgbValue);
    });

    it('#updateColor should not call any function when no instance of main color or secondary color is provided', () => {
        spyOn(service, 'updateSecondaryColor');
        spyOn(service, 'updateMainColor');
        service.updateColor(DEFAULT_COLOR, DEFAULT_COLOR);
        expect(service.updateSecondaryColor).not.toHaveBeenCalled();
        expect(service.updateMainColor).not.toHaveBeenCalled();
    });

    it('constructor sets main color and secondary color correctly', () => {
        const EXPECT_INDEX0: Color = { rgbValue: 'rgb(255,0,0)', opacity: 1 };
        const EXPECT_INDEX1: Color = { rgbValue: 'rgb(0,0,255)', opacity: 1 };
        expect(service.mainColor).toEqual(EXPECT_INDEX0);
        expect(service.secondaryColor).toEqual(EXPECT_INDEX1);
    });
});
