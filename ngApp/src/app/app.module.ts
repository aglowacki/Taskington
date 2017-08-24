import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule, JsonpModule } from "@angular/http";

import { AppComponent } from './app.component';
import { JobListComponent, XrfJobComponent, PtychographyJobComponent, ProcessNodesComponent } from './component/components';
import { GrowlService, SchedulerService } from "./service/services"
import { EmailInputComponent, JobPathInputComponent } from "./component/widget/widgets"

import { DataTableModule, PanelModule, TabViewModule, SharedModule, InputTextModule} from 'primeng/primeng'
import { ButtonModule, DialogModule, TreeModule, CheckboxModule, SelectButtonModule } from 'primeng/primeng'
import { DropdownModule, SpinnerModule, DataListModule, GrowlModule, ListboxModule } from 'primeng/primeng'
import {ConfirmDialogModule,ConfirmationService} from 'primeng/primeng';
import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome'
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent,
    JobListComponent,
    XrfJobComponent,
    EmailInputComponent,
    JobPathInputComponent,
    PtychographyJobComponent,
    ProcessNodesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    Angular2FontawesomeModule,
    HttpModule,
    JsonpModule,
    DataTableModule,
    PanelModule,
    TabViewModule,
    InputTextModule,
    ButtonModule,
    SelectButtonModule,
    TreeModule,
    SpinnerModule,
    DropdownModule,
    DataListModule,
    GrowlModule,
    DialogModule,
    CheckboxModule,
    SharedModule,
    BrowserAnimationsModule,
    ConfirmDialogModule,
    ListboxModule
  ],
  providers: [GrowlService, SchedulerService, ConfirmationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
