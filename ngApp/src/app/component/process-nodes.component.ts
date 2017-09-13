/**
 * Created by djarosz on 8/11/17.
 */

import {SchedulerService} from "../service/services";
import {Component, OnDestroy} from "@angular/core";
import {ProcessNodes, ProcessNode} from "../service/model/models";
import {Observable} from "rxjs";
import {StylesConstants} from "../constants/styles.constants";
import {AuthenticationService} from "../service/Authentication.service";

const PROCESSING_STATUS: string = "Processing";
const IDLE_STATUS: string = "Idle";
const OFFLINE_STATUS: string = "OFFLINE";

@Component({
  selector: 'process-nodes',
  templateUrl: './process-nodes.component.html'
})

export class ProcessNodesComponent implements OnDestroy {
  processNodes: ProcessNodes;
  expandedNodes: ProcessNode[];
  loadProcessNodeSubscription;
  authenticationSubscription;
  private _nodeKeys: string[];

  constructor(private schedulerService: SchedulerService,
              private authenticationService: AuthenticationService) {
    this.expandedNodes = [];

    this.subscribeToLoadingProcessNodes(this.authenticationService.loggedIn);
    this.authenticationSubscription = this.authenticationService.loginChange.subscribe(loggedIn => this.subscribeToLoadingProcessNodes(loggedIn));
  }

  private subscribeToLoadingProcessNodes(loggedIn: boolean) {
    if (loggedIn) {
      this.loadProcessNodes();
      this.loadProcessNodeSubscription = Observable.interval(4000).subscribe(() => this.loadProcessNodes());
    }
    // on logout, it gets destroyed.
  }

  ngOnDestroy(): void {
    this.loadProcessNodeSubscription.unsubscribe();
    this.authenticationSubscription.unsubscribe();
  }

  private loadProcessNodes() {
    if (this.authenticationService.loggedIn) {
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
        },
        error => this.processNodes = null
      );
    }
  }

  get nodeKeys(): string[] {
    if (this._nodeKeys == null) {
      this._nodeKeys = Object.keys(new ProcessNode());
    }
    return this._nodeKeys;
  }

  getStyleForPercentage(percentageValue: number): string {
    if (percentageValue < 26) {
      return StylesConstants.GOOD_COLUMN_DATA_SPAN;
    }
    if (percentageValue < 66) {
      return StylesConstants.WARNING_COLUMN_DATA_SPAN
    }
    return StylesConstants.ALERT_COLUMN_DATA_SPAN;
  }

  getStyleForStatus(status: string): string {
    if (IDLE_STATUS == status) {
      return StylesConstants.GOOD_COLUMN_DATA_SPAN;
    }
    if (PROCESSING_STATUS == status) {
      return StylesConstants.WARNING_COLUMN_DATA_SPAN;
    }
    return StylesConstants.ALERT_COLUMN_DATA_SPAN;
  }

}

