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
import { PencilAttributeComponent } from './components/attributes/pencil-attribute/pencil-attribute.component';
import { ShapeAttributeComponent } from './components/attributes/shape-attribute/shape-attribute/shape-attribute.component';
import { ColorPanelComponent } from './components/color-panel/color-panel.component';
import { ColorPickerComponent } from './components/color-picker/color-picker.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { OptionBarComponent } from './components/option-bar/option-bar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ToolBarComponent } from './components/tool-bar/tool-bar.component';
import { ResizeContainerComponent } from './components/resize-container/resize-container.component';

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
        ColorPickerComponent,
        ResizeContainerComponent,
        PencilAttributeComponent,
        ShapeAttributeComponent,
        ToolBarComponent,
        OptionBarComponent,
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
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {
    // adding icons packs for font-awesome
    constructor(library: FaIconLibrary) {
        library.addIconPacks(fas);
    }
}
