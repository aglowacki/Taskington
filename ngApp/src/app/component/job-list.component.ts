/**
 * Created by djarosz on 7/12/17.
 */
import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Jobs} from "../service/model/Jobs";
import {Job} from "../service/model/Job";
import {MapsArgs} from "../service/model/jobArgs/MapsArgs";
import {PtycholibArgs} from "../service/model/jobArgs/PtycholibArgs";
import {MapsUtil} from "../utilities/mapsUtil";

@Component({
  selector: 'job-list',
  templateUrl: './job-list.component.html',
})
export class JobListComponent implements OnChanges {
  @Input() jobsValue: Jobs;
  @Input() listTitle: string;
  private _expandedItems: Job[];
  private _jobKeys: string[];

  constructor() {
    this._expandedItems = [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.jobsValue != undefined) {
      if (this._expandedItems.length > 0) {
        let newExpandedItems: Job[];
        newExpandedItems = [];

        let jobsVal = <Jobs> changes.jobsValue.currentValue;
        for (let expanedJob of this._expandedItems) {
          for (let job of jobsVal.data) {
            if (expanedJob.Id == job.Id) {
              newExpandedItems.push(job);
            }
          }
        }

        this._expandedItems = newExpandedItems;
      }
    }
  }

  get expandedItems(): Job[] {
    return this._expandedItems;
  }

  set expandedItems(value: Job[]) {
    this._expandedItems = value;
  }

  get jobKeys(): string[] {
    if (this._jobKeys == undefined) {
      this._jobKeys = this.getKeys(new Job());
      for (var _i = 0; _i < this._jobKeys.length; _i++) {
        if (this._jobKeys[_i] == "Args") {
          this._jobKeys.splice(_i, 1);
          break;
        }
      }
    }
    return this._jobKeys;
  }

  getKeys(object: any) {
    return Object.keys(object);
  }

  getStatusString(statusCode: number): string {
    switch (statusCode) {
      case 0:
        return "Waiting";
      case 1:
        return "Processing";
      case 2:
        return "Completed";
      case 3:
        return "Cancelling";
      case 4:
        return "Cancelled";
      default:
        return "Error Occurred";
    }
  }

  getAnalysisString(job: Job): string {
    let args = this.getArgsFromJob(job);

    if (args instanceof MapsArgs) {
      return MapsUtil.getProcMaskText(args.ProcMask)
    } else if (args instanceof PtycholibArgs) {
      return "Ptycholib";
    }
    return "";
  }

  private getArgsFromJob(job: Job) {
    switch (job.Experiment) {
      case "MapsPy":
      case "XRF-Maps":
        let maps = new MapsArgs();
        maps.initialize(job.Args);
        return maps;
      case "PtychoLib":
        let ptycho = new PtycholibArgs();
        ptycho.initialize(job.Args);
        return ptycho;
      default:
        return job.Args;
    }
  }
}
