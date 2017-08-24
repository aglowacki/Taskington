/**
 * Created by djarosz on 6/29/17.
 */
import { Injectable } from '@angular/core';
import {Http, RequestOptions, Headers} from '@angular/http';
import { Observable } from "rxjs";
import { ProcessNodes } from "./model/ProcessNodes";
import { Jobs } from "./model/Jobs";
import { Directory } from "./model/Directory"
import { environment } from '../../environments/environment';
import {Job} from "./model/Job";
import {GrowlService} from "./services";
import {ErrorObservable} from "rxjs/observable/ErrorObservable";
import {MdaFiles} from "./model/MdaFiles";

@Injectable()
export class SchedulerService {

  constructor(private http: Http, private growlService: GrowlService) {}

  private host: string = environment.hostUrl;

  private processError(processDescription: string, error: any): ErrorObservable {
    this.growlService.addErrorMessage("Error " + processDescription, error);
    return Observable.throw(error);
  }

  getProcessNodes(): Observable<ProcessNodes> {
    return this.http.get(this.host + '/process_node')
      .map(res => <ProcessNodes>res.json())
      .catch(err => {
        return this.processError('getting process nodes', err);
      });
  }

  getJobs(): Observable<Jobs> {
    return this.http.get(this.host + "/job")
      .map(res => <Jobs>res.json())
      .catch(err => {
        return this.processError("getting jobs", err);
      });
  }

  submitJob(job: Job): Observable<string> {
    return this.http.post(this.host + "/job", job, this.getStandardOptions())
      .map(res => res.text())
      .catch(err => {
        return this.processError("submitting job", err);
      });
  }

  cancelJob(job: Job): Observable<string> {
    let options = this.getStandardOptions();
    options.body = job;
    return this.http.delete(this.host + "/job", options)
      .map(response => response.text())
      .catch(err => {
        return this.processError("cancelling job", err);
      });
  }

  private getStandardOptions(): RequestOptions {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    return new RequestOptions({ headers: headers });
  }

  getUnprocessedJobs(): Observable<Jobs> {
    return this.http.get(this.host + "/get_all_unprocessed_jobs")
      .map(res => <Jobs>res.json())
      .catch(err => {
        return this.processError("getting unprocessed jobs", err);
      });
  }

  getProcessingJobs(): Observable<Jobs> {
    return this.http.get(this.host + "/get_all_processing_jobs")
      .map(res => <Jobs>res.json())
      .catch(err => {
        return this.processError("getting processed jobs", err);
      });
  }

  getFinishedJobs(): Observable<Jobs> {
    return this.http.get(this.host + "/get_all_finished_jobs")
      .map(res => <Jobs>res.json())
      .catch(err => {
        return this.processError("getting finished jobs", err);
      });
  }

  getDatasetDirsList(jobPath: string, depth: number): Observable<Directory[]> {
    let url = "/get_dataset_dirs_list?job_path=" + jobPath;
    url = url + "&depth=" + depth;

    return this.http.get(this.host + url)
      .map(res => <Directory[]>res.json())
      .catch(err => {
        return this.processError("getting dataset directory list", err);
      });
  }

  getMdaList(jobPath: string): Observable<MdaFiles> {
    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    let requestOptions: RequestOptions = new RequestOptions({ headers: headers});
    return this.http.get(this.host + "/get_mda_list?job_path=" + jobPath, requestOptions)
      .map(res => <MdaFiles>res.json())
      .catch(err => {
        return this.processError("getting mda file list", err);
      });
  }

}
