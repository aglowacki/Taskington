/**
 * Created by djarosz on 6/29/17.
 */
export class ProcessNode {
  Status: number;
  ComputerName: string;
  NumThreads: number;
  SupportedSoftware: string[];
  SystemCpuPercent: number;
  Port: number;
  Hostname: string;
  SystemSwapPercent: number;
  ProcessMemPercent: number;
  SystemMemPercent: number;
  Heartbeat: string;
  ProcessCpuPercent: number;
  Id: number;

  constructor() {
    this.Status = -1;
    this.ComputerName = "";
    this.NumThreads = 0;
    this.SupportedSoftware = [];
    this.SystemCpuPercent = 0;
    this.Port = 0;
    this.Hostname = "";
    this.SystemSwapPercent = 0;
    this.ProcessMemPercent = 0;
    this.SystemMemPercent = 0;
    this.Heartbeat = "";
    this.ProcessCpuPercent = 0;
    this.Id = 0;
  }
}
