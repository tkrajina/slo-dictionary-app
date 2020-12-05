import { Keyboard } from "react-native";
import { Observable } from "../utils/observable";

interface LocalRootStore {}

export class ApplicationStore {
  keyboardHeight = new Observable<number>(0);

  constructor(public readonly stores: LocalRootStore) {}

  async initAsync() {
    Keyboard.addListener("keyboardWillShow", (e) => {
      this.keyboardHeight.set(e.endCoordinates.height);
    });
    Keyboard.addListener("keyboardDidShow", (e) => {
      this.keyboardHeight.set(e.endCoordinates.height);
    });
    Keyboard.addListener("keyboardDidHide", () => {
      this.keyboardHeight.set(0);
    });
  }
}
