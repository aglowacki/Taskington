/**
 * Created by djarosz on 6/29/17.
 */
import {Injectable, EventEmitter} from '@angular/core';
import {Http, RequestOptions, Headers, Response} from '@angular/http';
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

  private host: string = environment.hostUrl;

  private _serviceErrorOccurred: EventEmitter<Response> = new EventEmitter();

  constructor(private http: Http, private growlService: GrowlService) {}

  get serviceErrorOccurred(): EventEmitter<Response> {
    return this._serviceErrorOccurred;
  }

  private processError(processDescription: string, error: Response): ErrorObservable {
    this._serviceErrorOccurred.emit(error);

    this.growlService.addErrorMessage("Error " + processDescription, error.text());
    return Observable.throw(error);
  }

  private getStandardOptions(): RequestOptions {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let requestOptions:RequestOptions = new RequestOptions({ headers: headers});
    if (!environment.production) {
      requestOptions.withCredentials = true
    }
    return requestOptions;
  }

  getProcessNodes(): Observable<ProcessNodes> {
    return this.http.get(this.host + '/process_node', this.getStandardOptions())
      .map(res => <ProcessNodes>res.json())
      .catch(err => {
        return this.processError('getting process nodes', err);
      });
  }

  getJobs(): Observable<Jobs> {
    return this.http.get(this.host + "/job", this.getStandardOptions())
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

  getUnprocessedJobs(): Observable<Jobs> {
    return this.http.get(this.host + "/get_all_unprocessed_jobs", this.getStandardOptions())
      .map(res => <Jobs>res.json())
      .catch(err => {
        return this.processError("getting unprocessed jobs", err);
      });
  }

  getProcessingJobs(): Observable<Jobs> {
    return this.http.get(this.host + "/get_all_processing_jobs", this.getStandardOptions())
      .map(res => <Jobs>res.json())
      .catch(err => {
        return this.processError("getting processed jobs", err);
      });
  }

  getFinishedJobs(): Observable<Jobs> {
    return this.http.get(this.host + "/get_all_finished_jobs", this.getStandardOptions())
      .map(res => <Jobs>res.json())
      .catch(err => {
        return this.processError("getting finished jobs", err);
      });
  }

  getDatasetDirsList(jobPath: string, depth: number): Observable<Directory[]> {
    let url = "/get_dataset_dirs_list?job_path=" + jobPath;
    url = url + "&depth=" + depth;

    return this.http.get(this.host + url, this.getStandardOptions())
      .map(res => <Directory[]>res.json())
      .catch(err => {
        return this.processError("getting dataset directory list", err);
      });
  }

  getMdaList(jobPath: string): Observable<MdaFiles> {
    let requestOptions: RequestOptions = this.getStandardOptions();
    requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    return this.http.get(this.host + "/get_mda_list?job_path=" + jobPath, requestOptions)
      .map(res => <MdaFiles>res.json())
      .catch(err => {
        return this.processError("getting mda file list", err);
      });
  }

  getAuthenticatedUsername(): Observable<string> {
    return this.http.get(this.host + "/get_authenticated_username", this.getStandardOptions())
      .map(res => res.text())
      .catch(err => {
        return this.processError("getting authenticated username", err);
      });
  }

  authenticateUser(username, password): Observable<string> {
    let data =
      {'username' : username,
       'password' : password
      };

    return this.http.post(this.host + "/authenticate_user", data, this.getStandardOptions())
      .map(res => {
        return res.text()
      })
      .catch(err => {
        return this.processError("authenticating user", err);
      });
  }

  logout(): Observable<any> {
    return this.http.post(this.host + "/logout", null, this.getStandardOptions());
  }

}
