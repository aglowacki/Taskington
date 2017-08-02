import {Args} from "./Args";
/**
 * Created by djarosz on 7/14/17.
 */

export class PtycholibArgs extends Args{
  AlgorithmEPIE: number;
  AlgorithmDM: number;
  CenterY: number;
  CenterX: number;
  ProbeModes: number;
  Iterations: number;
  Rotation: number;
  Threshold: number;
  ProbeSize: number;
  PixelSize: number;
  DiffractionSize: number;
  DetectorDistance: number;
  GPU_ID: number;
  CalcSTXM: number;

  initialize(input: any) {
    this.AlgorithmEPIE = input.AlgorithmEPIE;
    this.AlgorithmDM = input.AlgorithmDM;
    this.CenterY = input.CenterY;
    this.CenterX = input.CenterX;
    this.ProbeModes = input.ProbeModes;
    this.Iterations = input.Iterations;
    this.Rotation = input.Rotation;
    this.Threshold = input.Threshold;
    this.ProbeSize = input.ProbeSize;
    this.PixelSize = input.PixelSize;
    this.DiffractionSize = input.DiffractionSize;
    this.DetectorDistance = input.DetectorDistance;
    this.GPU_ID = input.GPU_ID;
    this.CalcSTXM = input.CalcSTXM;
  }
}
