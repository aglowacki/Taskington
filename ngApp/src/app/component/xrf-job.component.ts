/**
 * Created by djarosz on 7/21/17.
 */
import {Component} from "@angular/core";
import {ProcessNode, Job, MapsArgs} from "../service/model/models";
import { EmailInputComponent } from "./widget/widgets"
import {GrowlService, SchedulerService} from "../service/services";
import {MapsProcValues} from "../utility/model/mapsProcValues";
import {MapsUtil} from "../utility/mapsUtil";
import {SelectItem, Message} from "primeng/primeng";
import {JobPathOptionsItem} from "./widget/job-path-input.component";

const XFM0: string = "production";
const XFM0_DATA2: string = "verify";
const CNM: string = "cnm";

const DEFAULT_BEAMLINE: string = '2-ID-E';
const DEFAULT_PRIORITY: number = 5;
const DEFAULT_DETSTART: number = 0;
const DEFAULT_DETCOUNT: number = 4;
const DEFAULT_PROCFILES: number = 1;
const DEFAULT_PROCLINES: number = -1;
const DEFAULT_DATAPATH: string = "/";
const DEFAULT_VERSION: string = "9.00";
const DEFAULT_STATUS: number = 0;
const DEFAULT_DATASETFILENAMES: string = "all";
const DEFAULT_STARTPROCTIME: number = 0;
const DEFAULT_FINISHPROCTIME: number = 0;
const DEFAULT_XRFBIN: number = 0;
const DEFAULT_STANDARDS = "maps_standardinfo.txt";
const DEFAULT_IS_LIVE_JOB = 0;
const DEFAULT_NNLS = 0;
const DEFAULT_QUICKANDDIRTY = 0;
const DEFAULT_PROCESSNODE_ID = -1;

const MAPSPY_EXPERIMENT_NAME: string = "MapsPy";
const XRF_MAPS_EXPERIMENT_NAME: string = "XRF-Maps";

const EXPERIMENT_OPTIONS = [{label: MAPSPY_EXPERIMENT_NAME, value: MAPSPY_EXPERIMENT_NAME},
                            {label: XRF_MAPS_EXPERIMENT_NAME, value: XRF_MAPS_EXPERIMENT_NAME}];

@Component({
  selector: 'xrf-job',
  templateUrl: './xrf-job.component.html'
})

export class XrfJobComponent {
  jobPathOptionsItemList: JobPathOptionsItem[];

  analysisSelection: MapsProcValues[] = MapsUtil.getOptionsForForm();
  processNodesSelectItemList: SelectItem[];

  mapsJobArguments: MapsArgs;
  mapsJob: Job;

  // Need to be an object to work appropriately within ngFor input text.
  // value accessor must be used on each item in the list.
  emailAddresses: any[];

  // TODO Map directly to job.
  allDatasets: boolean;

  growlMessages: Message[];


  constructor(private schedulerService: SchedulerService, private growlService: GrowlService) {
    this.jobPathOptionsItemList = [];
    this.jobPathOptionsItemList.push({displayPrompt: 'xfm0', serviceRequest: XFM0});
    this.jobPathOptionsItemList.push({displayPrompt: 'xfm0-data2', serviceRequest: XFM0_DATA2});
    this.jobPathOptionsItemList.push({displayPrompt: 'CNM', serviceRequest: CNM});

    this.growlMessages = [];
    this.mapsJobArguments = new MapsArgs;
    this.mapsJob = new Job;
    delete this.mapsJob.Id;

    this.mapsJob.Experiment = EXPERIMENT_OPTIONS[0].value;
    this.mapsJob.BeamLine = DEFAULT_BEAMLINE;
    this.mapsJob.Priority = DEFAULT_PRIORITY;
    this.mapsJob.DataPath = DEFAULT_DATAPATH;
    this.mapsJob.Version = DEFAULT_VERSION;
    this.mapsJob.Status = DEFAULT_STATUS;
    this.mapsJob.StartProcTime = DEFAULT_STARTPROCTIME;
    this.mapsJob.FinishProcTime = DEFAULT_FINISHPROCTIME;
    this.mapsJob.DatasetFilesToProc = DEFAULT_DATASETFILENAMES;
    this.mapsJobArguments.DetectorElements = DEFAULT_DETCOUNT;
    this.mapsJobArguments.DetectorToStartWith = DEFAULT_DETSTART;
    this.mapsJobArguments.MaxLinesToProc = DEFAULT_PROCLINES;
    this.mapsJobArguments.MaxFilesToProc = DEFAULT_PROCFILES;
    this.mapsJobArguments.XRF_Bin = DEFAULT_XRFBIN;
    this.mapsJobArguments.Standards = DEFAULT_STANDARDS;
    this.mapsJobArguments.Is_Live_Job = DEFAULT_IS_LIVE_JOB;
    this.mapsJobArguments.NNLS = DEFAULT_NNLS;
    this.mapsJobArguments.QuickAndDirty = DEFAULT_QUICKANDDIRTY;
    this.mapsJob.Process_Node_Id = DEFAULT_PROCESSNODE_ID;

    this.schedulerService.getProcessNodes().subscribe( nodes => {
      let processNodes: ProcessNode[] = nodes.data;
      this.processNodesSelectItemList = [];
      this.processNodesSelectItemList.push({label: "Any", value: -1} as SelectItem);

      for (let processNode of processNodes) {
        let selectItem: SelectItem = {label: processNode.ComputerName, value: processNode.Id};
        this.processNodesSelectItemList.push(selectItem);
      }
    });
  }

  submitJob() {
    let procMask = MapsUtil.getProcMaskFromOptions(this.analysisSelection);

    this.mapsJob.Args = this.mapsJobArguments;
    this.mapsJobArguments.ProcMask = procMask;
    this.mapsJob.Emails = EmailInputComponent.getEmailCSV(this.emailAddresses);

    this.mapsJob.IsConcurrent = this.mapsJobArguments.Is_Live_Job;
    this.mapsJobArguments.XANES_Scan = this.isXrfJob() ? 1 : 0;

    this.schedulerService.submitJob(this.mapsJob).subscribe(res => {
      this.growlService.addSuccessMessage("Job Submitted", res);
    });
  }

  dataPathChange(event) {
    this.mapsJob.DataPath = event;
  }

  emailAddressChange(event) {
    this.emailAddresses = event;
  }

  get EXPERIMENT_OPTIONS(): any {
    return EXPERIMENT_OPTIONS;
  }

  isMapsPyJob(): boolean {
    return this.mapsJob.Experiment == MAPSPY_EXPERIMENT_NAME;
  }

  isXrfJob(): boolean {
    return this.mapsJob.Experiment == XRF_MAPS_EXPERIMENT_NAME;
  }

  private convertNumToBoolean(num: number): boolean {
    return num == 1 ? true : false;
  }

  private convertBooleanToNum(bool: boolean): number {
    return bool ? 1 : 0;
  }

  get is_live_job(): boolean {
    return this.convertNumToBoolean(this.mapsJobArguments.Is_Live_Job);
  }

  set is_live_job(bool: boolean) {
    this.mapsJobArguments.Is_Live_Job = this.convertBooleanToNum(bool);
  }

  get NNLS(): boolean {
    return this.convertNumToBoolean(this.mapsJobArguments.NNLS);
  }

  set NNLS(bool: boolean) {
    this.mapsJobArguments.NNLS = this.convertBooleanToNum(bool);
  }

  get QuickAndDirty(): boolean {
    return this.convertNumToBoolean(this.mapsJobArguments.QuickAndDirty);
  }

  set QuickAndDirty(bool: boolean) {
    this.mapsJobArguments.QuickAndDirty = this.convertBooleanToNum(bool);
  }
}
