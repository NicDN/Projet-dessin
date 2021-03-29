import { CUSTOM_ELEMENTS_SCHEMA, ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { FilterService, FilterType } from '@app/services/filter/filter.service';
import { ExportService } from '@app/services/option/export/export.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { ClipboardService } from 'ngx-clipboard';
import { Subject } from 'rxjs';
import { ExportDialogComponent } from './export-dialog.component';

// tslint:disable:no-string-literal
describe('ExportDialogComponent', () => {
    let component: ExportDialogComponent;
    let fixture: ComponentFixture<ExportDialogComponent>;

    let filterServiceSpy: jasmine.SpyObj<FilterService>;
    let exportServiceSpy: jasmine.SpyObj<ExportService>;
    let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<ExportDialogComponent>>;
    let snackbarServiceSpy: jasmine.SpyObj<SnackBarService>;
    let clipboardServiceSpy: jasmine.SpyObj<ClipboardService>;

    const CANVAS_DEFAULT_WIDTH = 10;
    const CANVAS_DEFAULT_HEIGHT = 10;
    const FILE_NAME = 'fileName';
    const FILE_FORMAT = 'png';
    const EXPECTED_URL = 'expected url';

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_DEFAULT_WIDTH;
    canvas.height = CANVAS_DEFAULT_HEIGHT;

    const refCanvas: ElementRef<HTMLCanvasElement> = ({
        nativeElement: canvas,
    } as unknown) as ElementRef;

    const drawingServiceMock = {
        canvas,
    } as DrawingService;

    // tslint:disable: no-any
    beforeEach(async(() => {
        matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        exportServiceSpy = jasmine.createSpyObj('ExportService', ['handleImgurExport', 'handleLocalExport']);
        filterServiceSpy = jasmine.createSpyObj('FilterService', ['applyFilter']);
        snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
        clipboardServiceSpy = jasmine.createSpyObj('ClipboardService', ['copy']);

        TestBed.configureTestingModule({
            declarations: [ExportDialogComponent],
            imports: [MatDialogModule, MatButtonToggleModule, MatSnackBarModule],
            providers: [
                { provide: ExportService, useValue: exportServiceSpy },
                { provide: FilterService, useValue: filterServiceSpy },
                { provide: MatDialogRef, useValue: matDialogRefSpy },
                { provide: DrawingService, useValue: drawingServiceMock },
                { provide: SnackBarService, useValue: snackbarServiceSpy },
                { provide: ClipboardService, useValue: clipboardServiceSpy },
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

    it("#exportCanvas should call export service's #handleLocalExport if exportToImgur is false ", () => {
        component.exportToImgur = false;
        component.exportCanvas(FILE_NAME, FILE_FORMAT);
        expect(exportServiceSpy.handleLocalExport).toHaveBeenCalledWith(FILE_NAME, FILE_FORMAT);
        expect(matDialogRefSpy.close).toHaveBeenCalled();
    });

    it('#exportCanvas should display error message to user if a error occured when exporting to imgur', async () => {
        exportServiceSpy.handleImgurExport.and.rejectWith('fake error');
        component.exportToImgur = true;
        await component.exportCanvas(FILE_NAME, FILE_FORMAT);

        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith('Le téléversement a échoué.', 'Fermer');
        expect(matDialogRefSpy.close).toHaveBeenCalled();
    });

    it('#exportCanvas should call #displaySnackBarOnSuccess with the uploaded URL image ', async () => {
        exportServiceSpy.handleImgurExport.and.resolveTo(EXPECTED_URL);
        component.exportToImgur = true;

        spyOn<any>(component, 'displaySnackBarOnSuccess');
        await component.exportCanvas(FILE_NAME, FILE_FORMAT);
        expect(component['displaySnackBarOnSuccess']).toHaveBeenCalledWith(EXPECTED_URL);
        expect(matDialogRefSpy.close).toHaveBeenCalled();
    });

    it('#displaySnackBarOnSuccess should display the succeded snack bar and copy the url on action event ', () => {
        const matSnackBarRefSpy: jasmine.SpyObj<MatSnackBarRef<TextOnlySnackBar>> = jasmine.createSpyObj('MatSnackBarRef', ['onAction']);
        const subject: Subject<void> = new Subject();

        matSnackBarRefSpy.onAction.and.returnValue(subject);
        snackbarServiceSpy.openSnackBar.and.returnValue(matSnackBarRefSpy);

        component['displaySnackBarOnSuccess'](EXPECTED_URL);

        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith(
            'Le téléversement a été effectué avec succès! URL: ' + EXPECTED_URL,
            "Copier l'URL",
            component['IMGUR_SNACK_BAR_TIME_MS'],
        );

        subject.next();
        expect(clipboardServiceSpy.copy).toHaveBeenCalledWith(EXPECTED_URL);
    });
});
