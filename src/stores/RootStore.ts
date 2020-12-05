import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { CollocationEntry, ThesaurusEntry } from "../models/models";
import { Observable } from "../utils/observable";
import { Dao } from "../utils/dao";
import * as Toasts from "../utils/toasts";
import { ApplicationStore } from "./ApplicationStore";

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

  public readonly app: ApplicationStore = new ApplicationStore(this);
  public dao: Dao;

  constructor(databaseFile: string, public readonly isTest: boolean) {
    if (storeInstances[databaseFile]) {
      throw new Error(`Store ${databaseFile} already initialized`);
    }
    storeInstances[databaseFile] = this;
    this.dao = {} as Dao; // tmp

    setImmediate(async () => {
      try {
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

        await this.initModels();
        await Promise.all([this.app.initAsync()]);
        this.ready.set(true);
      } catch (e) {
        console.error("Error initializing:");
        console.error(e);
        Toasts.error("Error initializing app: " + e);
      }
    });
  }

  private async initModels() {
    await Promise.all([
      this.dao.registerModelAsync(ThesaurusEntry),
      this.dao.registerModelAsync(CollocationEntry)
    ]);
  }
}

export const stores = new RootStore(DATABASE_FILE, false);
