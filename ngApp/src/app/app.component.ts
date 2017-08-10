import {Component, ViewEncapsulation} from '@angular/core';
import {SchedulerService, GrowlService} from "./service/services";
import {ProcessNodes} from "./service/model/ProcessNodes";
import {Observable} from "rxjs";
import {Jobs} from "./service/model/Jobs";
import {ProcessNode} from "./service/model/ProcessNode";

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

  private _nodeKeys: string[];
  expandedNodes: ProcessNode[];

  constructor(private schedulerService: SchedulerService, public growlService: GrowlService) {
    this.loadData();
    this.expandedNodes = [];

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
      processNodes => {
        this.processNodes = processNodes;
        let newExpandedNodes: ProcessNode[] = [];
        for (let expandedNode of this.expandedNodes) {
          for (let node of processNodes.data) {
            if (expandedNode.Id == node.Id) {
              newExpandedNodes.push(node);
            }
          }
        }
        this.expandedNodes = newExpandedNodes;
      }
    );
  }

  get nodeKeys(): string[] {
    if (this._nodeKeys == null) {
      this._nodeKeys = Object.keys(new ProcessNode());
    }
    return this._nodeKeys;
  }
}
