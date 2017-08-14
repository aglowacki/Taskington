import {Component, ViewEncapsulation} from '@angular/core';
import {SchedulerService, GrowlService} from "./service/services";
import {Observable} from "rxjs";
import {Jobs} from "./service/model/Jobs";

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

  constructor(private schedulerService: SchedulerService, public growlService: GrowlService) {
    this.loadData();

    Observable.interval(4000).subscribe(() => {
      this.loadData();
    });
  }

  private loadData() {
    this.loadJobs();
  }

  private loadJobs() {
    this.schedulerService.getUnprocessedJobs().subscribe(
      unprocessedJobs => this.queuedJobs = unprocessedJobs
    );

    this.schedulerService.getFinishedJobs().subscribe(
      finishedJobs => this.finishedJobs = finishedJobs
    );

    this.schedulerService.getProcessingJobs().subscribe(
      processingJobs => this.processingJobs = processingJobs
    );

    this.schedulerService.getFinishedJobs()
  }
}
