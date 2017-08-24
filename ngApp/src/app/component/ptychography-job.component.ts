/**
 * Created by djarosz on 8/4/17.
 */
import {Component, ViewChild} from "@angular/core";
import {JobPathOptionsItem, JobPathInputComponent} from "./widget/job-path-input.component";
import {Job} from "../service/model/Job";
import {PtycholibArgs} from "../service/model/jobArgs/PtycholibArgs";
import {BooleanUtil} from "../utility/utilities";
import {SelectItem} from 'primeng/primeng';
import {SchedulerService, GrowlService} from '../service/services';
import {ProcessNode} from "../service/model/models";
import {EmailInputComponent} from "./widget/widgets";

const XFM0PATH = "pty";
const EXPERIMENT_NAME = "PtychoLib";
const DEFAULT_BEAMLINE = "2-ID-D";
const DEFAULT_VERSION = "1.00";
const DEFAULT_STATUS = 0;
const DEFAULT_PRIORITY = 5;
const DEFAULT_START_PROC_TIME = 0;
const DEFAULT_FINISH_PROC_TIME = 0;
const DEFAULT_LOG_PATH = '';
const DEFAULT_IS_CONCURRENT = 1;
const DEFAULT_CALCSTXM = 0;
const DEFAULT_ALGEPIE = 0;
const DEFAULT_ALGDM = 0;
const DEFAULT_GPUID = 0;
const DEFAULT_DET_DIST = 2.0;
const DEFAULT_DET_PIXEL_SIZE = 172;
const DEFAULT_DIFF_CEN_Y = 310;
const DEFAULT_DIFF_CEN_X = 243;
const DEFAULT_DIFF_SIZE = 256;
const DEFAULT_DIFF_ROT = 0;
const DEFAULT_PROBE_SIZE = 100;
const DEFAULT_PROBE_MODES = 1;
const DEFAULT_THRESHOLD = 0;
const DEFAULT_ITERATION = 100;
const DEFAULT_DATA_PATH = "/";

const ALLOWED_PROCESS_NODE_NAMES: string[] = ["xfm1"];

const GPU_OPTIONS: any[] = [{value: 0, label: 'Tesla K40c'},
  {value:1, label: 'Tesla K20c'},
  {value:2, label: 'Tesla K20c'},
  {value:3, label: 'Tesla P100'},
  {value:4, label: 'Tesla K40c'},
  {value:5, label: 'Tesla P100'},
  {value:6, label: 'Tesla K20c'}];

@Component({
  selector: 'ptychography-job',
  templateUrl: './ptychography-job.component.html'
})

export class PtychographyJobComponent {
  jobPathOptionsItemList: JobPathOptionsItem[];
  processNodesSelectOptions: SelectItem[];

  ptyJob: Job;
  ptyJobArgs: PtycholibArgs;

  @ViewChild(JobPathInputComponent)
  jobPathInput: JobPathInputComponent;

  @ViewChild(EmailInputComponent)
  emailInput: EmailInputComponent;

  constructor(private schedulerService: SchedulerService, private growlService: GrowlService) {
    this.jobPathOptionsItemList = [];
    this.jobPathOptionsItemList.push({displayPrompt: 'xfm0', serviceRequest:  XFM0PATH});

    this.ptyJob = new Job;
    this.ptyJobArgs = new PtycholibArgs;
    delete this.ptyJob.Id;

    this.ptyJob.Experiment = EXPERIMENT_NAME;
    this.ptyJob.BeamLine = DEFAULT_BEAMLINE;
    this.ptyJob.Version = DEFAULT_VERSION;
    this.ptyJob.Status = DEFAULT_STATUS;
    this.ptyJob.Priority = DEFAULT_PRIORITY;
    this.ptyJob.StartProcTime = DEFAULT_START_PROC_TIME;
    this.ptyJob.FinishProcTime = DEFAULT_FINISH_PROC_TIME;
    this.ptyJob.Log_Path = DEFAULT_LOG_PATH;
    this.ptyJob.DataPath = DEFAULT_DATA_PATH;
    this.ptyJob.IsConcurrent = DEFAULT_IS_CONCURRENT;

    this.ptyJobArgs.CalcSTXM = DEFAULT_CALCSTXM;
    this.ptyJobArgs.AlgorithmDM = DEFAULT_ALGDM;
    this.ptyJobArgs.AlgorithmEPIE = DEFAULT_ALGEPIE;
    this.ptyJobArgs.GPU_ID = DEFAULT_GPUID;
    this.ptyJobArgs.DetectorDistance = DEFAULT_DET_DIST;
    this.ptyJobArgs.PixelSize = DEFAULT_DET_PIXEL_SIZE;
    this.ptyJobArgs.CenterY = DEFAULT_DIFF_CEN_Y;
    this.ptyJobArgs.CenterX = DEFAULT_DIFF_CEN_X;
    this.ptyJobArgs.DiffractionSize = DEFAULT_DIFF_SIZE;
    this.ptyJobArgs.Rotation = DEFAULT_DIFF_ROT;
    this.ptyJobArgs.ProbeSize = DEFAULT_PROBE_SIZE;
    this.ptyJobArgs.ProbeModes = DEFAULT_PROBE_MODES;
    this.ptyJobArgs.Threshold = DEFAULT_THRESHOLD;
    this.ptyJobArgs.Iterations = DEFAULT_ITERATION;

    this.schedulerService.getProcessNodes().subscribe( nodes => {
      let processNodes: ProcessNode[] = nodes.data;
      this.processNodesSelectOptions = [];

      for (let processNode of processNodes) {
        for (let allowedNode of ALLOWED_PROCESS_NODE_NAMES) {
          if (allowedNode == processNode.Hostname) {
            let selectItem: SelectItem = {label: processNode.ComputerName, value: processNode.Id};
            this.processNodesSelectOptions.push(selectItem);
            if (this.ptyJob.Process_Node_Id == null) {
              this.ptyJob.Process_Node_Id = processNode.Id;
            }
          }
        }

      }
    });
  }

  submitJob() {
      this.ptyJob.Args = this.ptyJobArgs;

      this.ptyJob.Emails = this.emailInput.getEmailCSV();
      this.ptyJob.DataPath = this.jobPathInput.dataPath;
      this.ptyJob.DatasetFilesToProc = this.jobPathInput.getJobSubmissionDatasetsString();

      this.schedulerService.submitJob(this.ptyJob).subscribe(res => {
        this.growlService.addSuccessMessage("Job Submitted", res);
      });
  }

  get gpuOptions(): any[] {
    return GPU_OPTIONS;
  }

  get calculatedSTXMAndDPC() {
    return BooleanUtil.convertNumToBoolean(this.ptyJobArgs.CalcSTXM);
  }

  set calculatedSTXMAndDPC(value) {
    this.ptyJobArgs.CalcSTXM = BooleanUtil.convertBooleanToNum(value);
  }

  get algEpie() {
    return BooleanUtil.convertNumToBoolean(this.ptyJobArgs.AlgorithmEPIE)
  }

  set algEpie(value) {
    this.ptyJobArgs.AlgorithmEPIE = BooleanUtil.convertBooleanToNum(value);
  }

  get algDm() {
    return BooleanUtil.convertNumToBoolean(this.ptyJobArgs.AlgorithmDM)
  }

  set algDm(value) {
    this.ptyJobArgs.AlgorithmDM = BooleanUtil.convertBooleanToNum(value);
  }
}
