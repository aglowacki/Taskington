import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { JobListComponent } from './components/job-list.component';
import { XrfJobComponent } from './components/xrf-job.component';
import { HttpModule, JsonpModule } from "@angular/http";
import { DataTableModule, PanelModule, TabViewModule, SharedModule, InputTextModule} from 'primeng/primeng'
import { ButtonModule, DialogModule, TreeModule, CheckboxModule, SelectButtonModule } from 'primeng/primeng'
import { DropdownModule, SpinnerModule, DataListModule, GrowlModule } from 'primeng/primeng'
import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome'
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";
import {GrowlService} from "./service/Growl.service";
import {SchedulerService} from "./service/Scheduler.service";

@NgModule({
  declarations: [
    AppComponent,
    JobListComponent,
    XrfJobComponent
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
    BrowserAnimationsModule
  ],
  providers: [GrowlService, SchedulerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
