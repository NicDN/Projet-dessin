import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { AttributesPanelComponent } from './components/attributes-panel/attributes-panel.component';
import { ColorPanelComponent } from './components/color-panel/color-panel.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { OptionBarComponent } from './components/option-bar/option-bar.component';
import { ResizeContainerComponent } from './components/resize-container/resize-container.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ToolBarComponent } from './components/tool-bar/tool-bar.component';
import { ThicknessSelectorComponent } from './components/thickness-selector/thickness-selector.component';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { TraceTypeSelectorComponent } from './components/trace-type-selector/trace-type-selector.component';
import { far } from '@fortawesome/free-regular-svg-icons';
import { LineSettingsSelectorComponent } from './components/line-settings-selector/line-settings-selector.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ColorSliderComponent } from './components/color-slider/color-slider.component';
import { ColorPaletteComponent } from './components/color-palette/color-palette.component';
import { ClickOutsideModule } from 'ng-click-outside';
import { MatInputModule } from '@angular/material/input';

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
        ClickOutsideModule,
        MatInputModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {
    // adding icons packs for font-awesome
    constructor(library: FaIconLibrary) {
        library.addIconPacks(fas, far);
    }
}
