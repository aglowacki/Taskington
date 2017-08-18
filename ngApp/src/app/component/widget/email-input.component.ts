/**
 * Created by djarosz on 8/4/17.
 */
import {Component, Input, Output, EventEmitter} from "@angular/core";

@Component({
  selector: 'email-input',
  templateUrl: 'email-input.component.html'
})

export class EmailInputComponent {

  private _emailAddresses: any[];

  constructor() {
    this.emailAddresses = [];
  }

  get emailAddresses(): any[] {
    return this._emailAddresses;
  }

  set emailAddresses(value: any[]) {
    this._emailAddresses = value;
  }

  addNewEmail() {
    this.emailAddresses.push({value: ""});
  }

  removeEmail(index: number) {
    this.emailAddresses.splice(index, 1);
  }

  getEmailCSV(): string {
    let result = "";
    if (this.emailAddresses != null) {
      for (let email of this.emailAddresses) {
        if (result != "") {
          result += ", ";
        }
        result += email.value;
      }
    }
    return result;
  }

}
