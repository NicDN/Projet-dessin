import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
// tslint:disable-next-line: no-duplicate-imports
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { DrawingService } from '@app/services/drawing/drawing.service';

import { FilterService, FilterType } from '@app/services/filter/filter.service';
import { ExportService } from '@app/services/option/export/export.service';

import { ExportDialogComponent } from './export-dialog.component';

// tslint:disable:no-string-literal
describe('ExportDialogComponent', () => {
    let component: ExportDialogComponent;
    let fixture: ComponentFixture<ExportDialogComponent>;

    let filterServiceSpy: jasmine.SpyObj<FilterService>;
    let exportServiceSpy: jasmine.SpyObj<ExportService>;
    let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<ExportDialogComponent>>;

    const CANVAS_DEFAULT_WIDTH = 10;
    const CANVAS_DEFAULT_HEIGHT = 10;

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_DEFAULT_WIDTH;
    canvas.height = CANVAS_DEFAULT_HEIGHT;

    const refCanvas: ElementRef<HTMLCanvasElement> = ({
        nativeElement: canvas,
    } as unknown) as ElementRef;

    const drawingServiceMock = {
        canvas,
    } as DrawingService;

    beforeEach(async(() => {
        matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        exportServiceSpy = jasmine.createSpyObj('ExportService', ['exportCanvas']);
        filterServiceSpy = jasmine.createSpyObj('FilterService', ['applyFilter']);

        TestBed.configureTestingModule({
            declarations: [ExportDialogComponent],
            imports: [MatDialogModule, MatButtonToggleModule],
            providers: [
                { provide: ExportService, useValue: exportServiceSpy },
                { provide: FilterService, useValue: filterServiceSpy },
                { provide: MatDialogRef, useValue: matDialogRefSpy },
                { provide: DrawingService, useValue: drawingServiceMock },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExportDialogComponent);
        component = fixture.componentInstance;
        component.canvas = refCanvas;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#ngAfterViewInit should set the initial preview canvas correctly', () => {
        spyOn(component['canvasCtx'], 'drawImage');
        component.ngAfterViewInit();
        expect(component['canvasCtx']).toBe(component.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D);
        expect(component['canvasCtx'].drawImage).toHaveBeenCalled();
        expect(component['exportService'].canvasToExport).toBe(component.canvas.nativeElement);
    });

    it("#applyFilter should call filterService's #applyFilter", () => {
        component.applyFilter(FilterType.Blur);
        expect(filterServiceSpy.applyFilter).toHaveBeenCalled();
    });

    it("#exportCanvas should call exportService's #exportCanvas", () => {
        const FILE_NAME = 'fileName';
        const FILE_FORMAT = 'png';
        component.exportCanvas(FILE_NAME, FILE_FORMAT);
        expect(exportServiceSpy.exportCanvas).toHaveBeenCalled();
        expect(exportServiceSpy.exportCanvas).toHaveBeenCalledWith(FILE_NAME, FILE_FORMAT);
        expect(matDialogRefSpy.close).toHaveBeenCalled();
    });
});
