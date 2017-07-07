import {Component, ViewEncapsulation} from '@angular/core';
import {SchedulerService} from "./service/Scheduler.service";
import {ProcessNodes} from "./service/model/ProcessNodes";
import {Observable} from "rxjs";
import {Jobs} from "./service/model/Jobs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [SchedulerService],
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    '../../node_modules/font-awesome/css/font-awesome.min.css',
    '../../node_modules/primeng/resources/primeng.min.css',
    '../../node_modules/primeng/resources/themes/omega/theme.css',
  ]
})
export class AppComponent {
  title = 'Taskington';
  processNodes: ProcessNodes;
  jobs: Jobs;

  constructor(private schedulerService: SchedulerService) {
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
    this.schedulerService.getJobs().subscribe(
      jobs => this.jobs = jobs
    );
  }

  private loadProcessNodes() {
    this.schedulerService.getProcessNodes().subscribe(
      processNodes => this.processNodes = processNodes
    );
  }
}
