import Toast from "react-native-root-toast";
import * as Strings from "./strings";

export function short(...msgs: any[]) {
  return Toast.show(Strings.joinStrings(msgs, " "), {
    duration: Toast.durations.SHORT,
    position: Toast.positions.CENTER,
  });
}

export function long(...msgs: any[]) {
  return Toast.show(Strings.joinStrings(msgs, " "), {
    duration: Toast.durations.LONG,
    position: Toast.positions.CENTER,
  });
}

export function error(...msgs: any[]) {
  return Toast.show(Strings.joinStrings(msgs, " "), {
    duration: Toast.durations.SHORT,
    position: Toast.positions.CENTER,
    backgroundColor: "red",
  });
}

export function warning(...msgs: any[]) {
  return Toast.show(Strings.joinStrings(msgs, " "), {
    duration: Toast.durations.SHORT,
    position: Toast.positions.CENTER,
    backgroundColor: "orange",
  });
}

export function logAndDebugIfDev(...msgs: any[]) {
  if (__DEV__) {
    const msg = Strings.joinStrings(msgs, " ");
    console.debug(msg);
    return short(msg);
  }
}
