import {MapsProcValues} from "./model/mapsProcValues";
/**
 * Created by djarosz on 7/26/17.
 */

const PROC_DESCRIPTION_LIST: string[] =
  ["(A) Analyze datasets using ROI and ROI+ :: ",
   "(B) Extract integrated spectra from analyzed files and fit the spectra to optimize fit parameters :: ",
   "(C) Analyze datasets using ROI, ROI+ and per pixel fitting :: ",
   "(D) :: ",
   "(E) Add exchange information to analyzed files :: ",
   "(F) Create hdf5 file from single line netcdf files for flyscan :: ",
   "(G) Generate average .h5 from each detector :: "
  ];

const SKIPPROCINDEX: number[] = [3, 5];
const DEFAULT_PROCMASK = 65;

export class MapsUtil {

  static getProcMaskText(procMask: number): string {
    let result = "";

    for (let i =0; i < PROC_DESCRIPTION_LIST.length; i++) {
      if (procMask & (1 << i)) {
        result += PROC_DESCRIPTION_LIST[i];
      }
    }

    return result;
  }

  static getOptionsForForm(): MapsProcValues[] {
    let result = [];
    for (var i =0; i < PROC_DESCRIPTION_LIST.length; i++) {
      let skip = false;
      for (var j = 0; j < SKIPPROCINDEX.length; j++) {
        if (SKIPPROCINDEX[j] == i) {
          skip = true;
          break;
        }
      }

      if (skip) { continue; }

      let currentItem = new MapsProcValues;
      currentItem.prompt = PROC_DESCRIPTION_LIST[i];
      currentItem.value = (DEFAULT_PROCMASK & (1 << i)) != 0;
      result.push(currentItem);
    }

    return result;
  }

  static getProcMaskFromOptions(options: MapsProcValues[]) : number {
    var result = 0;

    for (let i = 0; i < options.length; i++) {
      let option: MapsProcValues = options[i];
      if (option.value) {
        var index = -1;
        for (let j = 0; j < PROC_DESCRIPTION_LIST.length; j++) {
          if (PROC_DESCRIPTION_LIST[j] == option.prompt) {
            index = j;
            break;
          }
        }

        if (index != -1) {
          result += (1 << index);
        }
      }
    }

    return result;
  }

}
