import * as SQLite from "expo-sqlite";
import * as Strings from "./strings";
import * as ReactUtils from "./react_utils";

const DEBUG_LOGS = false;
__DEV__;

export enum Types {
  TEXT = "TEXT",
  NUMERIC = "NUMERIC",
  INTEGER = "INTEGER",
  REAL = "REAL",
  BLOB = "BLOB",
}

enum Mode {
  READONLY,
  UPDATE,
}

// ----------------------------------------------------------------------------------------------------

let lastId: number;

function idGenerator() {
  let newId = new Date().getTime();
  if (newId == lastId) {
    newId++;
  }
  lastId = newId;
  return lastId;
}

export class QueryPage {
  constructor(public limit: number = 100, public offset: number = 0) {}

  next() {
    return new QueryPage(this.limit, this.offset + this.limit);
  }
}

export class ModelDescriptor<T extends Model<any>> {
  tableName: string;
  columns: ModelColumn<T>[] = [];
  idType: Types = Types.NUMERIC;
  idTypeString: string;

  constructor(tableName: string, primaryKeyType: Types.INTEGER | Types.TEXT = Types.INTEGER) {
    this.tableName = tableName;
    this.idTypeString = `id ${primaryKeyType} primary key not null`;
    this.withColumn(
      "id",
      this.idType,
      (t: T) => t.id,
      (t: T, value: any) => (t.id = value),
      idGenerator
    );
  }

  withUniqueColumn(columnName: string, columnDbType: Types, getter: (t: T) => any, setter: (t: T, val: any) => void, generator?: () => any) {
    const c = new ModelColumn(columnName, columnDbType, getter, setter, generator);
    c.uniqueIndex = true;
    this.columns.push(c);
    return this;
  }

  withColumn(columnName: string, columnDbType: Types, getter: (t: T) => any, setter: (t: T, val: any) => void, generator?: () => any) {
    this.columns.push(new ModelColumn(columnName, columnDbType, getter, setter, generator));
    return this;
  }
}

class ModelColumn<T extends Model<any>> {
  public uniqueIndex: boolean = false;
  constructor(
    public readonly columnName: string,
    public readonly columnDbType: Types,
    public readonly getter: (t: T) => any,
    public readonly setter: (t: T, val: any) => void,
    public readonly generator?: () => any
  ) {}
}

export abstract class Model<T> {
  id: T | undefined;

  constructor() {}

  abstract getModelDescriptor(): ModelDescriptor<any>;
}

export class Dao {
  dbName: string;

  tables: { [tableName: string]: boolean } = {};

  db: SQLite.WebSQLDatabase;

  tableChangeListener: { [tableName: string]: (() => void)[] } = {};

  constructor(dbFilename: string) {
    this.dbName = dbFilename;
    this.db = SQLite.openDatabase(dbFilename) as SQLite.WebSQLDatabase;
  }

  async execAsync(sql: string, args: any[] = [], mode: Mode = Mode.UPDATE): Promise<SQLite.ResultSet> {
    this.log(sql, args);
    return new Promise<SQLite.ResultSet>((resolve, reject) => {
      try {
        this.db.exec([{ sql: sql, args: args }], mode === Mode.READONLY, (error?, resultSets?) => {
          if (!resultSets || resultSets.length == 0) {
            reject(new Error("No resultsets"));
          }
          const resultSet = (resultSets as any)[0];
          if (error) {
            reject(error);
          } else {
            if ((<SQLite.ResultSetError>resultSet).error) {
              reject((<SQLite.ResultSetError>resultSet).error);
            } else {
              resolve(<SQLite.ResultSet>resultSet);
            }
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  registerTableChangeListener(table: string, listener: () => void) {
    if (this.tableChangeListener[table] === undefined) {
      this.tableChangeListener[table] = [];
    }
    this.tableChangeListener[table].push(listener);
  }

  private notifyTableChange(table: string) {
    ReactUtils.callAfterInteraction(() => this.tableChangeListener[table]?.map((listener) => listener()));
  }

  assertNoDoubleColumns(desc: ModelDescriptor<any>) {
    let columns: { [dbName: string]: boolean } = {};
    for (const fld of desc.columns) {
      console.debug("adding", fld.columnDbType, "with", columns.length, "flds");
      if (columns[fld.columnName]) {
        throw new Error(`Double column ${fld.columnName}`);
      }
      columns[fld.columnDbType] = true;
    }
  }

  async registerModelAsync(mClass: { new (): Model<any> }, checkTable: boolean = true) {
    const m = new mClass();
    const descr = m.getModelDescriptor();
    console.debug(this.dbName, "registering", descr.tableName);
    if (this.tables[descr.tableName]) {
      console.error(this.dbName, "table", descr.tableName, "already exists!!!");
    } else {
      this.tables[descr.tableName] = true;
    }

    if (!checkTable) {
      return;
    }

    this.assertNoDoubleColumns(descr);

    await this.execAsync(`create table if not exists ${descr.tableName} (${descr.idTypeString})`);
    let rs = await this.execAsync(`pragma table_info(${descr.tableName})`);

    const columns: { [columnName: string]: boolean } = {};
    for (const i in rs.rows) {
      const row = rs.rows[i];
      //console.debug(this.dbName, "Found column", descr.tableName, "/", row.name, "type=", row.type);
      columns[row.name] = true;
    }

    //console.log(this.dbName, "columns in", descr.tableName, ":", JSON.stringify(columns));
    for (const column of descr.columns) {
      if (!columns[column.columnName]) {
        await this.execAsync(`alter table ${descr.tableName} add column ${column.columnName} ${column.columnDbType}`);
        if (column.uniqueIndex) {
          await this.execAsync(`CREATE UNIQUE INDEX IF NOT EXISTS ${column.columnName}_unique_idx ON ${descr.tableName}(${column.columnName})`);
        }
      }
    }
  }

  /** Load and fails if the row is not found. */
  async loadAsync<T extends Model<any>>(mClass: { new (): T }, id: any): Promise<T> {
    if (!id) {
      return Promise.reject(new Error("Empty id"));
    }

    try {
      return Promise.resolve(await this.loadIfExistsAsync(mClass, id));
    } catch (err) {
      return Promise.reject(err);
    }
  }

  private prepareSelectQuery(columnsList: string | true, desc: ModelDescriptor<any>, where: string, page?: QueryPage) {
    let columns = "";
    if (columnsList === true) {
      for (const column of desc.columns) {
        if (columns) columns += ", ";
        columns += column.columnName;
      }
    } else {
      columns = columnsList as string;
    }
    let sql = `select ${columns} from ${desc.tableName} ${where || ""}`;
    if (page) {
      sql += ` limit ${page.limit} offset ${page.offset}`;
    }
    return sql;
  }

  /** Not an error if model is not found (returns null). */
  async loadIfExistsAsync<T extends Model<any>>(mClass: { new (): T }, id?: any): Promise<T> {
    if (!id) {
      return Promise.resolve((null as any) as T);
    }

    const m = new mClass();
    if (id) {
      m.id = id;
    }

    const sql = this.prepareSelectQuery(true, m.getModelDescriptor(), `where id=?`);
    const rs = await this.execAsync(sql, [id]);
    if (rs.rows.length != 1) {
      return Promise.resolve((null as any) as T);
    }

    try {
      this.mapRowToObject(rs.rows[0], m);
      return Promise.resolve(m);
    } catch (e) {
      console.error(this.dbName, "Error running %o: %e", sql, e);
      return Promise.reject(e);
    }
  }

  async insertAsync<T extends Model<any>>(m: T) {
    //console.log("saving:" + JSON.stringify(m));
    const desc = m.getModelDescriptor();
    let values: any[] = [];

    // console.log(`m.id=${m.id}, ${!!m.id}`);

    let columns: string[] = [];
    let valsString: string[] = [];
    for (const column of desc.columns) {
      columns.push(column.columnName);
      valsString.push("?");
      const val = column.getter(m);
      //console.debug(`column ${column.columnName}, val=${JSON.stringify(val)}`);
      if (!val && column.generator) {
        const generated = column.generator();
        values.push(generated);
        column.setter(m, generated);
      } else {
        values.push(val);
      }
    }

    ReactUtils.callAfterInteraction(() => this.notifyTableChange(desc.tableName));
    const rs = await this.execAsync(`insert into ${desc.tableName} (${Strings.joinStrings(columns, ", ")}) values (${Strings.joinStrings(valsString, ", ")})`, values);
    console.log("rows after insert=" + JSON.stringify(rs));
    //console.log(this.getRowsAffected(rs));
    console.log(`rs.rowsAffected=${rs.rowsAffected}`);
    if (rs.rowsAffected != 1) {
      return Promise.reject(new Error(`not inserting ${m.getModelDescriptor().tableName}/${m.id}`));
    }
    return Promise.resolve(m);
  }

  async saveOrUpdateAsync<T extends Model<any>>(m: T) {
    if (m.id) {
      return await this.updateAsync(m);
    }
    return await this.insertAsync(m);
  }

  async updateAsync<T extends Model<any>>(m: T) {
    // console.log("saving:" + JSON.stringify(m));
    const desc = m.getModelDescriptor();
    let values: any[] = [];

    let sql: string = "";

    // console.log(`m.id=${m.id}, ${!!m.id}`);

    let set = [];
    for (const column of desc.columns) {
      if (column.columnName != "id") {
        set.push(`${column.columnName}=?`);
        values.push(column.getter(m));
      }
    }
    values.push(m.id);
    ReactUtils.callAfterInteraction(() => this.notifyTableChange(desc.tableName));
    const rs = await this.execAsync(`update ${desc.tableName} set ${Strings.joinStrings(set, ", ")} where id=?`, values);
    // console.log("rows after save=" + JSON.stringify(rs.rows));
    if (rs.rowsAffected == 1) {
      return Promise.resolve(m);
    } else {
      console.error(`Error running: ${sql}: rowsAffected=${rs.rowsAffected}`);
      return Promise.reject(new Error(`not found ${m.id}`));
    }
  }

  deleteManyAsync<T extends Model<any>>(models: T[]) {
    const promises = [];
    for (const m of models) {
      promises.push(this.deleteAsync(m));
    }
    return Promise.all(promises);
  }

  async deleteAsync<T extends Model<any>>(m: T): Promise<void> {
    if (!m.id) {
      return Promise.reject(new Error("id not set"));
    }
    const desc = m.getModelDescriptor();
    const sql = `delete from ${desc.tableName} where id=?`;
    const rs = await this.execAsync(sql, ["" + m.id]);
    ReactUtils.callAfterInteraction(() => this.notifyTableChange(desc.tableName));
    if (rs.rowsAffected == 1) {
      Promise.resolve();
    } else {
      console.warn(`Error running: ${sql}: rowsAffected=${rs.rowsAffected}`);
      return Promise.reject(new Error(`not found ${m.id}`));
    }
  }

  /**
   * Returns number of affected rows.
   */
  async executeUpdate<T extends Model<any>>(m: { new (): T }, sql: string, params?: any[]): Promise<number> {
    const desc = new m().getModelDescriptor();

    sql = `update ${desc.tableName} ${sql}`;
    const rs = await this.execAsync(sql, params);
    return Promise.resolve(rs.rowsAffected);
  }

  async sumColumnAsync<T extends Model<any>>(column: string, m: { new (): T }, where: string, params?: any[]) {
    const desc = new m().getModelDescriptor();
    const sql = this.prepareSelectQuery(`sum(${column}) as _sum`, desc, where);

    const rs = await this.execAsync(sql, params);
    for (const i in rs.rows) {
      const sum = rs.rows[i]["_sum"] as number;
      return Promise.resolve(sum ? sum : 0);
    }

    return Promise.resolve(0);
  }

  async countAsync<T extends Model<any>>(m: { new (): T }, where: string, params?: any[], page?: QueryPage): Promise<number> {
    const desc = new m().getModelDescriptor();

    const sql = this.prepareSelectQuery("count(*) as _count", desc, where, page);
    const rs = await this.execAsync(sql, params);
    for (const i in rs.rows) {
      const count = rs.rows[i]["_count"] as number;
      return Promise.resolve(count);
    }
    return Promise.resolve(0);
  }

  /** Raw query. The model here is just to get the table name */
  async queryRawAsync(sql: string = "", params: any[] = [] /*, page: QueryPage = undefined*/): Promise<Array<any>> {
    const rs = await this.execAsync(sql, params);
    return Promise.resolve(rs.rows);
  }

  async query<T extends Model<any>>(m: { new (): T }, where: string = "", params: any[] = [], page?: QueryPage): Promise<T[]> {
    const desc = new m().getModelDescriptor();

    const sql = this.prepareSelectQuery(true, desc, where, page);
    const rs = await this.execAsync(sql, params);
    // console.log("rows after save=" + JSON.stringify(rs.rows));
    const res: T[] = [];
    for (const i in rs.rows) {
      const r = new m();
      this.mapRowToObject(rs.rows[i], r);
      res.push(r);
    }
    return Promise.resolve(res);
  }

  private mapRowToObject = (row: any, m: Model<any>) => {
    //console.log("mapping:" + JSON.stringify(row));
    console.assert(!!m, "missing model");
    console.assert(row, "missing row");
    //console.log(`row=${JSON.stringify(row)}`);
    for (const column of m.getModelDescriptor().columns) {
      if (!(column.columnName in row)) {
        console.error(`${column.columnName} not found in ${row}`);
      }
      const val = row[column.columnName];
      column.setter(m, val);
      //console.log(`after setting ${val} in ${column.columnName}, result is ${JSON.stringify(m)}`);
    }
  };

  private log = (sql: string, params: any[] = []) => {
    if (!DEBUG_LOGS) {
      return;
    }
    if (__DEV__) {
      let i = 0;
      sql = sql.replace(/\?/g, () => {
        const p = params[i++];
        //console.log(`${p} -> ${typeof p}`);
        switch (typeof p) {
          case "number":
            return "" + p;
          case "boolean":
            return "" + p;
          default:
            return "'" + p + "'";
        }
      });
      console.debug(this.dbName, "dbg sql:", sql);
    } else {
      console.debug(this.dbName, "sql:", sql, "params:", params);
    }
  };
}
