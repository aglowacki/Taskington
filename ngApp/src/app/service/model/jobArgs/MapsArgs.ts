import {Args} from "./Args";
import {Input} from "@angular/core";
/**
 * Created by djarosz on 7/14/17.
 */

export class MapsArgs extends Args {
  Is_Live_Job: number;
  Standards: string;
  DetectorElements: number;
  MaxFilesToProc: number;
  MaxLinesToProc: number;
  QuickAndDirty: number;
  XRF_Bin: number;
  NNLS: number;
  XANES_Scan: number;
  DetectorToStartWith: number;
  ProcMask: number;

  initialize(input: any) {
    this.Is_Live_Job = input.Is_Live_Job;
    this.Standards = input.Standards;
    this.DetectorElements = input.DetectorElements;
    this.MaxLinesToProc = input.MaxLinesToProc;
    this.MaxFilesToProc = input.MaxFilesToProc;
    this.QuickAndDirty = input.QuickAndDirty;
    this.XRF_Bin = input.XRF_Bin;
    this.NNLS = input.NNLS;
    this.XANES_Scan = input.XANES_Scan;
    this.DetectorToStartWith = input.DetectorToStartWith;
    this.ProcMask = input.ProcMask;
  }
}

