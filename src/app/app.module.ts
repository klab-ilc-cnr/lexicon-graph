import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header/header.component';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { TreeModule } from 'primeng/tree';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { ScrollerModule } from 'primeng/scroller'
import { TooltipModule } from 'primeng/tooltip';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DragDropModule } from 'primeng/dragdrop';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SplitterModule } from 'primeng/splitter';
import { AngularResizeEventModule } from 'angular-resize-event';

import { ViewportComponent } from './viewport/viewport.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CytoscapeGraphComponent } from './cytoscape-graph/cytoscape-graph.component';
import { TreeComponent } from './tree/tree.component';
import { ResizeDirective } from './resize.directive';
import { ToolbarComponent } from './cytoscape-graph/toolbar/toolbar.component';
import { faRoute, faChevronDown, faChevronUp, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ViewportComponent,
    SidebarComponent,
    CytoscapeGraphComponent,
    TreeComponent,
    ResizeDirective,
    ToolbarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    TreeModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ButtonModule,
    SidebarModule,
    NgbModule,
    InputTextModule,
    TabViewModule,
    RadioButtonModule,
    DropdownModule,
    DividerModule,
    ScrollerModule,
    FontAwesomeModule,
    TooltipModule,
    ScrollPanelModule,
    DragDropModule,
    ProgressSpinnerModule,
    InputSwitchModule,
    SplitterModule,
    AngularResizeEventModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(
      faRoute,
      faChevronDown,
      faChevronUp,
      faTriangleExclamation);
  }
}
