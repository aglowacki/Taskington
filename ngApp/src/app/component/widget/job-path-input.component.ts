/**
 * Created by djarosz on 8/4/17.
 */
import {Component, ViewEncapsulation, Input, EventEmitter, Output} from "@angular/core";
import {Directory} from "../../service/model/models";
import {SchedulerService} from "../../service/services";
import {TreeNode} from "primeng/primeng";

const DIR_STRUCTURE_DEPTH = 3;

@Component({
  selector: 'job-path-input',
  templateUrl: './job-path-input.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [ 'job-path-input.component.css' ]
})

export class JobPathInputComponent {
  displayDirectorySelectionDialog: boolean = false;
  directories: Directory[];
  directorySelectionTree: TreeNode[];
  selectedDirectory: TreeNode;
  private _allDatasets: boolean;

  private _dataPath: string;
  @Input() jobPathOptionsItemList: JobPathOptionsItem[];
  @Output() dataPathChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() allDatasetsChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private schedulerService: SchedulerService) {

  }

  get allDatasets(): boolean {
    return this._allDatasets;
  }

  set allDatasets(value: boolean) {
    this.allDatasetsChange.emit(value);
    this._allDatasets = value;
  }

  get dataPath(): string {
    return this._dataPath;
  }

  set dataPath(value: string) {
    this.dataPathChange.emit(value);
    this._dataPath = value;
  }

  @Input()
  set defaultDataPath(value: string) {
    this._dataPath = value;
  }

  showDirectoryDialog(serviceRequest: string) {
    this.loadDirectoryDialog(serviceRequest);
  }

  private loadDirectoryDialog(jobPath: string) {
    this.schedulerService.getDatasetDirsList(jobPath, DIR_STRUCTURE_DEPTH)
      .subscribe(
        directories => {
          this.updateDirectories(directories);
          this.displayDirectorySelectionDialog = true;
        }
      );
  }

  private updateDirectories(directories: Directory[]) {
    this.directories = directories;
    let parentNode = null;
    this.directorySelectionTree = [];

    let directoryNodeList = [];
    let lastParentIndex = 0;
    for (let directory of this.directories) {
      let newNode = {
        label: directory.text,
        data: directory,
        expandedIcon: "fa-folder-open",
        collapsedIcon: "fa-folder",
        selectable: true,
        parent: null,
        expanded: false,
      };

      if (directory.parent != "#") {
        if (directoryNodeList.length > 0) {
          parentNode = directoryNodeList[lastParentIndex];
          if (this.getFullParentPath(parentNode) != directory.parent) {
            parentNode = null;
            for (var i = 0; i < directoryNodeList.length; i++) {
              let curTreeNode = directoryNodeList[i];
              let parentPath = this.getFullParentPath(curTreeNode);
              if (parentPath == directory.parent) {
                parentNode = curTreeNode;
                lastParentIndex = i;
                break;
              }
            }
          }
          if (parentNode != null) {
            if (parentNode.children == null) {
              parentNode.children = [];
            }

            newNode.parent = parentNode;
            parentNode.children.push(newNode);
          }


        }
      } else {
        // Expand the first parent.
        newNode.expanded = true;
      }

      if (parentNode == null) {
        this.directorySelectionTree.push(newNode);
      }
      directoryNodeList.push(newNode);
    }
  }

  private getFullParentPath(treeNode: TreeNode): string {
    let result = "";
    if (treeNode.parent != null) {
      let parent = treeNode.parent;
      if (parent.parent == null) {
        // Top most parent has the full path in text value
        result += parent.data.text;
      } else {
        result += treeNode.data.parent;
      }
      // The server varies the return string to contain the / sometimes.
      if (result.charAt(result.length -1) != '/') {
        result += '/';
      }
    }

    result += treeNode.data.text;
    return result;
  }

  makeDirectorySelection() {
    if (this.selectedDirectory != null) {
      let jobPath = "";
      let directory = <Directory>this.selectedDirectory.data;
      if (directory.parent != "#") {
        let parentPath = directory.parent;
        if (parentPath.charAt(parentPath.length -1) != '/') {
          parentPath += '/';
        }
        jobPath = parentPath;
      }

      jobPath += directory.text;
      //TODO add this to the xrf-job page
      this.dataPath = jobPath;
    }
    this.displayDirectorySelectionDialog = false;
  }
}

export class JobPathOptionsItem {
  displayPrompt: string;
  serviceRequest: string;
}

