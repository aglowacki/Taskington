/**
 * Created by djarosz on 9/1/17.
 */

import {Injectable, EventEmitter} from "@angular/core";
import {SchedulerService} from "./Scheduler.service";
import {GrowlService} from "./Growl.service";

@Injectable()
export class AuthenticationService {

  private _username: string;
  private _loggedIn: boolean;

  private _loginChange: EventEmitter<boolean> = new EventEmitter();

  authUser: string;
  authPass: string;

  constructor(private schedulerService: SchedulerService,
              private growlService: GrowlService) {
    this.updateUsername(null);
    this.updateCurrentUsername();

    this.schedulerService.serviceErrorOccurred.subscribe(errorResponse => this.processServiceError(errorResponse));
  }

  get loginChange(): EventEmitter<boolean> {
    return this._loginChange;
  }

  private processServiceError(errorResponse: Response) {
    if (errorResponse.status == 401) {
      this.updateCurrentUsername(true);
    }
  }

  private updateCurrentUsername(warnOnLogout=false) {
    this.schedulerService.getAuthenticatedUsername().subscribe(usernameResponse => {
      if (warnOnLogout && !this.loggedIn) {
        warnOnLogout = false;
      }
      this.updateUsername(usernameResponse);
      if (warnOnLogout && !this.loggedIn) {
        this.growlService.addWarnMessage("Logged Out", "User session no longer valid, user has been logged out.")
      }
    });
  }

  private updateUsername(username) {
    this._username = username;
    if (this._username == "" || this._username == null) {
      this._loggedIn = false;
    } else {
      this.growlService.addSuccessMessage("Logged in", "Successfully logged in as " + username);
      this._loggedIn = true;
    }
    this.loginChange.emit(this._loggedIn);
  }

  get loggedIn() {
    return this._loggedIn;
  }

  get username() {
    return this._username;
  }

  loginUser() {
    this.schedulerService.authenticateUser(this.authUser, this.authPass)
      .subscribe(username => {
        this.updateUsername(username);

        this.authUser = null;
        this.authPass = null;
      });
  }

  logout() {
    this.schedulerService.logout()
      .subscribe(res => {
        this.growlService.addSuccessMessage("Logged out", "User " + this.username + " logged out");
        this.updateUsername(null);
      });
  }



}
