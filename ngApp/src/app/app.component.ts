import {Component, ViewEncapsulation} from '@angular/core';
import {SchedulerService, GrowlService} from "./service/services";
import {Observable} from "rxjs";
import {Jobs} from "./service/model/Jobs";
import {AuthenticationService} from "./service/Authentication.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    '../../node_modules/font-awesome/css/font-awesome.css',
    '../../node_modules/primeng/resources/themes/omega/theme.css',
    '../../node_modules/primeng/resources/primeng.min.css',
    'app.component.css'
  ]
})
export class AppComponent {
  title = 'Taskington';
  queuedJobs: Jobs;
  processingJobs: Jobs;
  finishedJobs: Jobs;

  constructor(private schedulerService: SchedulerService,
              private growlService: GrowlService,
              private authenticationService: AuthenticationService) {
    this.loadData();

    this.authenticationService.loginChange.subscribe(loggedIn => {
      if (loggedIn){
        this.loadData();
      } else {
        this.queuedJobs = null;
        this.processingJobs = null;
        this.finishedJobs = null;
      }
    });

    Observable.interval(4000).subscribe(() => {
      this.loadData();
    });
  }

  private loadData() {
    if (this.authenticationService.loggedIn) {
      this.loadJobs();
    }
  }

  private loadJobs() {
    this.schedulerService.getUnprocessedJobs().subscribe(
      unprocessedJobs => this.queuedJobs = unprocessedJobs,
      error => this.queuedJobs = null
    );

    this.schedulerService.getFinishedJobs().subscribe(
      finishedJobs => this.finishedJobs = finishedJobs,
      error => this.finishedJobs = null
    );

    this.schedulerService.getProcessingJobs().subscribe(
      processingJobs => this.processingJobs = processingJobs,
      error => this.processingJobs = null
    );

    this.schedulerService.getFinishedJobs()
  }
}
