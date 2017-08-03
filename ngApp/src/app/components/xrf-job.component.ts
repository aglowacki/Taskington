/**
 * Created by djarosz on 7/21/17.
 */
import {Component, ViewEncapsulation} from "@angular/core";
import {Directory} from "../service/model/Directory";
import {ProcessNode} from "../service/model/ProcessNode";
import {SchedulerService} from "../service/Scheduler.service";
import {TreeNode} from "primeng/components/common/treenode";
import {MapsProcValues} from "../utilities/model/mapsProcValues";
import {MapsUtil} from "../utilities/mapsUtil";
import {Job} from "../service/model/Job";
import {SelectItem, Message} from "primeng/primeng";
import {MapsArgs} from "../service/model/jobArgs/MapsArgs";
import {GrowlService} from "../service/Growl.service";

const XFM0: string = "production";
const XFM0_DATA2: string = "verify";
const CNM: string = "cnm";
const DIR_STRUCTURE_DEPTH = 3;

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
  templateUrl: './xrf-job.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [ 'xrf-job.component.css' ]
})

export class XrfJobComponent {
  displayDirectorySelectionDialog: boolean = false;
  directories: Directory[];
  directorySelectionTree: TreeNode[];
  selectedDirectory: TreeNode;
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
    this.growlMessages = [];
    this.emailAddresses = [];
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
    this.mapsJob.Emails = "";
    for (let email of this.emailAddresses) {
      if (this.mapsJob.Emails != "") {
        this.mapsJob.Emails += ", ";
      }
      this.mapsJob.Emails += email.value;
    }

    this.mapsJob.IsConcurrent = this.mapsJobArguments.Is_Live_Job;
    this.mapsJobArguments.XANES_Scan = this.isXrfJob() ? 1 : 0;

    this.schedulerService.submitJob(this.mapsJob).subscribe(res => {
      this.growlService.addSuccessMessage("Job Submitted", res);
    });
  }

  makeDirectorySelection() {
    if (this.selectedDirectory != null) {
      let jobPath = "";
      let directory = <Directory>this.selectedDirectory.data;
      if (directory.parent != "#") {
        let parentPath = directory.parent;
        if (parentPath.charAt(parentPath.length -1) != '/') {
          parentPath += '/';
        }
        jobPath = parentPath;
      }

      jobPath += directory.text;
      this.mapsJob.DataPath = jobPath;
    }
    this.displayDirectorySelectionDialog = false;

  }

  showXfm0DirectoryDialog() {
    this.loadDirectoryDialog(XFM0);
  }

  showXfm0Data2DirectoryDialog() {
    this.loadDirectoryDialog(XFM0_DATA2);
  }

  showCNMDirectoryDialog() {
    this.loadDirectoryDialog(CNM);
  }

  private loadDirectoryDialog(jobPath: string) {
    this.schedulerService.getDatasetDirsList(jobPath, DIR_STRUCTURE_DEPTH)
      .subscribe(
        directories => {
          this.updateDirectories(directories);
          this.displayDirectorySelectionDialog = true;
        }
      );
  }

  private updateDirectories(directories: Directory[]) {
    this.directories = directories;
    let parentNode = null;
    this.directorySelectionTree = [];

    let directoryNodeList = [];
    let lastParentIndex = 0;
    for (let directory of this.directories) {
      let newNode = {
        label: directory.text,
        data: directory,
        expandedIcon: "fa-folder-open",
        collapsedIcon: "fa-folder",
        selectable: true,
        parent: null,
        expanded: false,
      };

      if (directory.parent != "#") {
        if (directoryNodeList.length > 0) {
          parentNode = directoryNodeList[lastParentIndex];
          if (this.getFullParentPath(parentNode) != directory.parent) {
            parentNode = null;
            for (var i = 0; i < directoryNodeList.length; i++) {
              let curTreeNode = directoryNodeList[i];
              let parentPath = this.getFullParentPath(curTreeNode);
              if (parentPath == directory.parent) {
                parentNode = curTreeNode;
                lastParentIndex = i;
                break;
              }
            }
          }
          if (parentNode != null) {
            if (parentNode.children == null) {
              parentNode.children = [];
            }

            newNode.parent = parentNode;
            parentNode.children.push(newNode);
          }


        }
      } else {
        // Expand the first parent.
        newNode.expanded = true;
      }

      if (parentNode == null) {
        this.directorySelectionTree.push(newNode);
      }
      directoryNodeList.push(newNode);
    }
  }

  private getFullParentPath(treeNode: TreeNode): string {
    let result = "";
    if (treeNode.parent != null) {
      let parent = treeNode.parent;
      if (parent.parent == null) {
        // Top most parent has the full path in text value
        result += parent.data.text;
      } else {
        result += treeNode.data.parent;
      }
      // The server varies the return string to contain the / sometimes.
      if (result.charAt(result.length -1) != '/') {
        result += '/';
      }
    }

    result += treeNode.data.text;
    return result;
  }

  addNewEmail() {
    this.emailAddresses.push({value: ""});
  }

  removeEmail(index: number) {
    this.emailAddresses.splice(index, 1);
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
