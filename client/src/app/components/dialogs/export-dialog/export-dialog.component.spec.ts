import { NO_ERRORS_SCHEMA } from '@angular/core';
// tslint:disable-next-line: no-duplicate-imports
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { FilterService, FilterType } from '@app/services/filter/filter.service';
import { ExportService } from '@app/services/option/export/export.service';

import { ExportDialogComponent } from './export-dialog.component';

// tslint:disable:no-string-literal
describe('ExportDialogComponent', () => {
    let component: ExportDialogComponent;
    let fixture: ComponentFixture<ExportDialogComponent>;

    let dialogRef: MatDialogRef<ExportDialogComponent>;
    let filterService: FilterService;
    let exportService: ExportService;

    // Il faut que je fasse un stub du viewChild du canvas ? en ce moment il est undefined

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ExportDialogComponent],
            imports: [MatDialogModule, MatButtonToggleModule],
            providers: [ExportService, FilterService, { provide: MatDialogRef, useValue: {} }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExportDialogComponent);
        component = fixture.componentInstance;
        dialogRef = TestBed.inject(MatDialogRef);
        exportService = TestBed.inject(ExportService);
        filterService = TestBed.inject(FilterService);

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
        expect(exportService.canvasToExport).toBe(component.canvas.nativeElement);
    });

    it('click from a mat option should toggle #applyfilter', () => {
        const filterMatOption = fixture.debugElement.query(By.css('.filter-mat-option'));
        spyOn(component, 'applyFilter');
        filterMatOption.triggerEventHandler('click', FilterType.Blur);
        expect(component.applyFilter).toHaveBeenCalledWith(FilterType.Blur);
    });

    it("#applyFilter should call filterService's #applyFilter", () => {
        spyOn(filterService, 'applyFilter');
        component.applyFilter(FilterType.Blur);
        expect(filterService.applyFilter).toHaveBeenCalled();
    });

    it('click from the export canvas button should toggle #exportCanvas', () => {
        const exportCanvasButton = fixture.debugElement.query(By.css('.exportCexport-canvas-btnanvas'));
        spyOn(component, 'exportCanvas');
        exportCanvasButton.triggerEventHandler('click', null);
        expect(component.exportCanvas).toHaveBeenCalled();
    });

    it("#exportCanvas should call exportService's #exportCanvas", () => {
        const FILE_NAME = 'fileName';
        const FILE_FORMAT = 'png';
        spyOn(exportService, 'exportCanvas');
        spyOn(dialogRef, 'close');
        component.exportCanvas(FILE_NAME, FILE_FORMAT);
        expect(exportService.exportCanvas).toHaveBeenCalled();
        expect(exportService.exportCanvas).toHaveBeenCalledWith(FILE_NAME, FILE_FORMAT);
        expect(dialogRef.close).toHaveBeenCalled();
    });
});
