/**
 * Created by djarosz on 8/4/17.
 */
import {Component, Input, Output, EventEmitter} from "@angular/core";

@Component({
  selector: 'email-input',
  templateUrl: 'email-input.component.html'
})

export class EmailInputComponent {

  @Output() emailChangeEvent: EventEmitter<any []> = new EventEmitter<any []>();

  private _emailAddresses: any[];

  constructor() {
    this.emailAddresses = [];
  }

  get emailAddresses(): any[] {
    return this._emailAddresses;
  }

  set emailAddresses(value: any[]) {
    this.emailChangeEvent.emit(value);
    this._emailAddresses = value;
  }

  addNewEmail() {
    this.emailAddresses.push({value: ""});
    this.emailChangeEvent.emit(this.emailAddresses);
  }

  removeEmail(index: number) {
    this.emailAddresses.splice(index, 1);
    this.emailChangeEvent.emit(this.emailAddresses);
  }

  static getEmailCSV(emailAddresses: any[]): string {
    let result = "";
    if (emailAddresses != null) {
      for (let email of emailAddresses) {
        if (result != "") {
          result += ", ";
        }
        result += email.value;
      }
    }
    return result;
  }

}
