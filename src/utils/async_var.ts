import AsyncStorage from "@react-native-community/async-storage";
import { Observable } from "./observable";
import * as ReactUtils from "./react_utils";

const CHECK_LOAD_INTERVAL = 30 * 1000;

/**
 * Custom variable that's automatically stored in AsyncStorage.
 * No need to mark with @observable, because the inner property is already observable.
 *
 * Can also be used to execute something only once, by usind onFirstSet.
 */
export class AsyncPersistedVariable<T extends any> extends Observable<T> {
  onFirstSet?: () => void;

  loaded = false;

  constructor(private key: string, initVal: T, onFirstSet?: () => void) {
    super(initVal);
    this.onFirstSet = onFirstSet;
    this.key = key;
    this.checkLoaded();
  }

  checkLoaded() {
    setTimeout(() => {
      //console.debug("checking if", this.key, "loaded");
      if (!this.loaded) {
        console.error("async persisted variable", this.key, "not loaded in", CHECK_LOAD_INTERVAL, ":", this.loaded);
      }
    }, CHECK_LOAD_INTERVAL);
  }

  set(val: T) {
    super.set(val);
    ReactUtils.callAfterInteraction(() => this.updateAsync());
  }

  async setAsync(val: T) {
    super.set(val);
    await this.updateAsync();
  }

  async loadAsync() {
    try {
      const preexistingVal = await AsyncStorage.getItem(this.key);
      if (preexistingVal === null && this._val !== null) {
        if (this.onFirstSet) {
          await this.onFirstSet();
        }
        await this.updateAsync();
      }
      if (preexistingVal) {
        this.set(JSON.parse(preexistingVal));
      }
      this.loaded = true;
    } catch (e) {
      throw new Error(`Error getting ${this.key}: ${e}`);
    }
    return this;
  }

  async updateAsync() {
    try {
      let jsn = JSON.stringify(this._val);
      if ("string" !== typeof jsn) {
        jsn = JSON.stringify(null);
      }
      await AsyncStorage.setItem(this.key, jsn);
      //console.log(`[${this.key}] saved ${jsn}`);
    } catch (e) {
      console.error(e);
    }
  }
}
