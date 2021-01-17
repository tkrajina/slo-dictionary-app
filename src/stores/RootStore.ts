import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { Alert, Keyboard, Platform } from "react-native";
import { AbstractWord, CollocationEntry, TableName, ThesaurusEntry } from "../models/models";
import { AsyncPersistedVariable } from "../utils/async_var";
import { Dao } from "../utils/dao";
import { Observable } from "../utils/observable";
import * as Toasts from "../utils/toasts";

export const DATABASE_FILE = `db4.sqlite`;

setTimeout(() => {
  if (Platform.OS === "ios") {
    console.debug("With iOS simulator, open database with:");
    console.debug("----------------------------------------------------------------------------------------------------");
    console.debug(`sqlite3 ${decodeURIComponent((FileSystem.documentDirectory as string).replace("file://", ""))}SQLite/${DATABASE_FILE}`);
    console.debug("----------------------------------------------------------------------------------------------------");
    console.debug(`document directory ${decodeURIComponent((FileSystem.documentDirectory as string).replace("file://", ""))}`);
    console.debug("----------------------------------------------------------------------------------------------------");
    console.debug(`cache directory ${decodeURIComponent((FileSystem.cacheDirectory as string).replace("file://", ""))}`);
    console.debug("----------------------------------------------------------------------------------------------------");
  }
}, 5 * 1000);

const storeInstances: { [dbFile: string]: any } = {};

export class RootStore {
  public ready = new Observable<boolean>(false);
  public keyboardHeight = new Observable<number>(0);
  public history = new AsyncPersistedVariable("__history__", [] as [TableName, string][]);

  public dao: Dao;

  constructor(databaseFile: string, public readonly isTest: boolean) {
    if (storeInstances[databaseFile]) {
      throw new Error(`Store ${databaseFile} already initialized`);
    }
    storeInstances[databaseFile] = this;
    this.dao = {} as Dao; // tmp

    Keyboard.addListener("keyboardWillShow", (e) => {
      this.keyboardHeight.setIfChanged(e.endCoordinates.height);
    });
    Keyboard.addListener("keyboardDidShow", (e) => {
      this.keyboardHeight.setIfChanged(e.endCoordinates.height);
    });
    Keyboard.addListener("keyboardWillHide", (_e) => {
      this.keyboardHeight.setIfChanged(0);
    });
    Keyboard.addListener("keyboardDidHide", (_e) => {
      this.keyboardHeight.setIfChanged(0);
    });

    setImmediate(async () => {
      try {
        await this.history.loadAsync();

        let file = await Asset.fromModule(require("../../assets/db/dict.sqlite")).downloadAsync();
        console.log("local url=" + file.localUri);
        const dbFileUrl = `${FileSystem.documentDirectory as string}${DATABASE_FILE}`;
        console.log(`copying from ${file.localUri} to ${dbFileUrl}`);
        await FileSystem.copyAsync({
          from: file.localUri as string,
          to: dbFileUrl,
        });
        console.log("downloaded");
        const info = await FileSystem.getInfoAsync(dbFileUrl);
        console.log(`info exists: ${info.exists} size: ${info.size}`);
        // By default expo-sqlite searched in SQLite dir, but ios woN't allow to write there, that's why the "../" here
        this.dao = new Dao("../" + DATABASE_FILE);

        await Promise.all([
          this.initModels(),
          this.history.loadAsync()
        ]);
        this.ready.set(true);
      } catch (e) {
        console.error("Error initializing:");
        console.error(e);
        Toasts.error("Error initializing app: " + e);
      }
    });
  }

  private async initModels() {
    await Promise.all([this.dao.registerModelAsync(ThesaurusEntry), this.dao.registerModelAsync(CollocationEntry)]);
  }

  public addHistory(w: AbstractWord) {
    const h = this.history.get() || [];
    for (let i = 0; i < h.length; i++) {
      if (i < 3 && h[i][0] === w.tableName && h[i][1] === w.word) {
        return; // Already added, nothing to do here
      }
    }
    if (h.length > 100) {
      h.pop()
      h.pop()
    }
    h.unshift([w.tableName, w.word]);
    this.history.set(h);
  }
}

export const stores = new RootStore(DATABASE_FILE, false);
