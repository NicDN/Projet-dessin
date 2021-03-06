import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { AttributesPanelComponent } from './components/attributes-panel/attributes-panel.component';
import { CardDrawingTemplateComponent } from './components/card-drawing-template/card-drawing-template.component';
import { ColorPaletteComponent } from './components/color/color-palette/color-palette.component';
import { ColorPanelComponent } from './components/color/color-panel/color-panel.component';
import { ColorSliderComponent } from './components/color/color-slider/color-slider.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { CarouselDialogComponent } from './components/dialogs/carousel-dialog/carousel-dialog.component';
import { ExportDialogComponent } from './components/dialogs/export-dialog/export-dialog.component';
import { SaveDialogComponent } from './components/dialogs/save-dialog/save-dialog.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { OptionBarComponent } from './components/option-bar/option-bar.component';
import { ResizeContainerComponent } from './components/resize-container/resize-container.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ToolBarComponent } from './components/tool-bar/tool-bar.component';
import { LineSettingsSelectorComponent } from './components/tool-settings/line-settings-selector/line-settings-selector.component';
import { PolygonSidesSelectorComponent } from './components/tool-settings/polygon-sides-selector/polygon-sides-selector.component';
import { SprayCanSettingsSelectorComponent } from './components/tool-settings/spray-can-settings-selector/spray-can-settings-selector.component';
import { ThicknessSelectorComponent } from './components/tool-settings/thickness-selector/thickness-selector.component';
import { TraceTypeSelectorComponent } from './components/tool-settings/trace-type-selector/trace-type-selector.component';
import { UndoRedoComponent } from './components/undo-redo/undo-redo.component';

@NgModule({
    declarations: [
        AppComponent,
        EditorComponent,
        SidebarComponent,
        DrawingComponent,
        MainPageComponent,
        AttributesPanelComponent,
        ControlPanelComponent,
        ColorPanelComponent,
        ResizeContainerComponent,
        ToolBarComponent,
        OptionBarComponent,
        ThicknessSelectorComponent,
        TraceTypeSelectorComponent,
        LineSettingsSelectorComponent,
        ColorSliderComponent,
        ColorPaletteComponent,
        SprayCanSettingsSelectorComponent,
        UndoRedoComponent,

        PolygonSidesSelectorComponent,
        CarouselDialogComponent,
        SaveDialogComponent,
        ExportDialogComponent,
        CardDrawingTemplateComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        MatDividerModule,
        FontAwesomeModule,
        MatTooltipModule,
        MatSliderModule,
        FormsModule,
        MatSlideToggleModule,
        MatInputModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatSelectModule,
        MatCheckboxModule,
        MatButtonToggleModule,
    ],
    entryComponents: [CarouselDialogComponent],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    bootstrap: [AppComponent],
})
export class AppModule {
    // adding icons packs for font-awesome
    constructor(library: FaIconLibrary) {
        library.addIconPacks(fas, far);
    }
}
