import {Args} from "./jobArgs/Args";
export class Job {
  Status: number;
  StartProcTime: number;
  Version: string;
  Process_Node_Id: number;
  DatasetFilesToProc: string;
  DataPath: string;
  Emails: string;
  Priority: number;
  Log_Path: string;
  Experiment: string;
  BeamLine: string;
  FinishProcTime: number;
  DT_RowId: number;
  Id: number;
  IsConcurrent: number;
  Args: Args;

  constructor() {
    this.Args = undefined;
    this.Id = null;
    this.BeamLine = "";
    this.Status = 0;
    this.StartProcTime = 0;
    this.FinishProcTime = 0;
    this.Version = "";
    this.Process_Node_Id = -1;
    this.DatasetFilesToProc = "";
    this.DataPath = "";
    this.Emails = "";
    this.Priority = 0;
    this.Log_Path = "";
    this.Experiment = "";
    this.DT_RowId = 0;
  }
}


