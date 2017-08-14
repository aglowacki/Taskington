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

@Injectable()
export class SchedulerService {

  constructor(private http: Http) {}

  private host: string = environment.hostUrl;

  getProcessNodes(): Observable<ProcessNodes> {
    return this.http.get(this.host + '/process_node')
      .map(res => <ProcessNodes>res.json());
  }

  getJobs(): Observable<Jobs> {
    return this.http.get(this.host + "/job")
      .map(res => <Jobs>res.json());
  }

  submitJob(job: Job): Observable<string> {
    return this.http.post(this.host + "/job", job, this.getStandardOptions())
      .map(res => res.text())
      .catch(err => {
        console.error(err);
        return Observable.throw(err);
      });
  }

  cancelJob(job: Job): Observable<string> {
    let options = this.getStandardOptions();
    options.body = job;
    return this.http.delete(this.host + "/job", options)
      .map(response => response.text())
      .catch(err => {
        console.error(err);
        return Observable.throw(err);
      });
  }

  private getStandardOptions():RequestOptions {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    return new RequestOptions({ headers: headers });
  }

  getUnprocessedJobs(): Observable<Jobs> {
    return this.http.get(this.host + "/get_all_unprocessed_jobs")
      .map(res => <Jobs>res.json());
  }

  getProcessingJobs(): Observable<Jobs> {
    return this.http.get(this.host + "/get_all_processing_jobs")
      .map(res => <Jobs>res.json());
  }

  getFinishedJobs(): Observable<Jobs> {
    return this.http.get(this.host + "/get_all_finished_jobs")
      .map(res => <Jobs>res.json());
  }

  getDatasetDirsList(jobPath: string, depth: number): Observable<Directory[]> {
    let url = "/get_dataset_dirs_list?job_path=" + jobPath;
    url = url + "&depth=" + depth;

    return this.http.get(this.host + url)
      .map(res => <Directory[]>res.json());
  }

}
