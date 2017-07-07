/**
 * Created by djarosz on 6/29/17.
 */
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import {Observable} from "rxjs";
import {ProcessNodes} from "./model/ProcessNodes";
import {Jobs} from "./model/Jobs";


@Injectable()
export class SchedulerService {

  constructor(private http: Http) {}

  private host: string = 'http://0.0.0.0:8081';

  getProcessNodes(): Observable<ProcessNodes> {
    return this.http.get('/process_node')
      .map(res => <ProcessNodes>res.json());
  }

  getJobs(): Observable<Jobs> {
    return this.http.get("/job")
      .map(res => <Jobs>res.json());
  }

}
