import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
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
import { ColorPaletteComponent } from './components/color-palette/color-palette.component';
import { ColorPanelComponent } from './components/color-panel/color-panel.component';
import { ColorSliderComponent } from './components/color-slider/color-slider.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { LineSettingsSelectorComponent } from './components/line-settings-selector/line-settings-selector.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { OptionBarComponent } from './components/option-bar/option-bar.component';
import { ResizeContainerComponent } from './components/resize-container/resize-container.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SprayCanSettingsSelectorComponent } from './components/spray-can-settings-selector/spray-can-settings-selector.component';
import { ThicknessSelectorComponent } from './components/thickness-selector/thickness-selector.component';
import { ToolBarComponent } from './components/tool-bar/tool-bar.component';
import { TraceTypeSelectorComponent } from './components/trace-type-selector/trace-type-selector.component';
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
    ],
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
