/**
 * Created by djarosz on 8/8/17.
 */

export class BooleanUtil {
  static convertNumToBoolean(num: number): boolean {
    return num == 1 ? true : false;
  }

  static convertBooleanToNum(bool: boolean): number {
    return bool ? 1 : 0;
  }
}
