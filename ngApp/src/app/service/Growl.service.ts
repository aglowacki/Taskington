/**
 * Created by djarosz on 8/1/17.
 */

import {Injectable} from "@angular/core";
import {Message} from "primeng/primeng";

const GROWL_MESSAGE_CLEAR_TIMEOUT: number = 5000;

@Injectable()
export class GrowlService {
  messages: Message[];
  timeoutReference: any;

  constructor() {
    this.resetVariables();
  }

  addErrorMessage(summaryText: string, detailText: string) {
    this.addMessage('error', summaryText, detailText);
  }

  addSuccessMessage(summaryText: string, detailText: string) {
    this.addMessage('success', summaryText, detailText);
  }

  private addMessage(severity: string, summaryText: string, detailText: string) {
    let newMessage: Message = {
      severity: severity,
      detail: detailText,
      summary: summaryText
    };
    this.messages.push(newMessage);

    this.addMessageTimeout();
  }

  private addMessageTimeout() {
    if (this.timeoutReference != null) {
      clearTimeout(this.timeoutReference);
      this.timeoutReference = null;
    }
    this.timeoutReference = setTimeout(() => {
      this.resetVariables()
    }, GROWL_MESSAGE_CLEAR_TIMEOUT);
  }

  private resetVariables() {
    this.messages = [];
    this.timeoutReference = null;
  }
}
