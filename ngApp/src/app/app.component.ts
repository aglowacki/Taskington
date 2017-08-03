import {Component, ViewEncapsulation} from '@angular/core';
import {SchedulerService} from "./service/Scheduler.service";
import {GrowlService} from "./service/Growl.service";
import {ProcessNodes} from "./service/model/ProcessNodes";
import {Observable} from "rxjs";
import {Jobs} from "./service/model/Jobs";
import {Message} from "primeng/primeng";

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
  processNodes: ProcessNodes;
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
    this.loadProcessNodes();
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

  private loadProcessNodes() {
    this.schedulerService.getProcessNodes().subscribe(
      processNodes => this.processNodes = processNodes
    );
  }
}
