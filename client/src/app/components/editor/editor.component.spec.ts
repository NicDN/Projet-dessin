import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { EditorComponent } from './editor.component';

describe('EditorComponent', () => {
    let component: EditorComponent;
    let fixture: ComponentFixture<EditorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EditorComponent, DrawingComponent, SidebarComponent],
            imports: [RouterTestingModule.withRoutes([{ path: 'editor', component: EditorComponent }])],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: MatDialog, useValue: {} },
                { provide: SnackBarService, useValue: {} },
                { provide: MatBottomSheet, useValue: {} },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
