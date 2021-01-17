import { Model, ModelDescriptor, Types } from "../utils/dao";

type TableName = "thesaurus" | "collocations";

export abstract class AbstractWord extends Model<number> {
  word: string = "";
  info_json: string = "";
  searchString: string = "";

  constructor() {
    super();
  }

  abstract tableName: TableName;

  info(): object {
    return JSON.parse(this.info_json);
  }

  getModelDescriptor(): ModelDescriptor<AbstractWord> {
    return new ModelDescriptor<AbstractWord>(this.tableName, Types.INTEGER)
      .withUniqueColumn(
        "word",
        Types.TEXT,
        (t) => t.word,
        (t, value: any) => (t.word = value)
      )
      .withColumn(
        "info_json",
        Types.TEXT,
        (t) => t.info_json,
        (t, value: any) => (t.info_json = value)
      )
      .withColumn(
        "search_str",
        Types.TEXT,
        (t) => t.searchString,
        (t, value: any) => (t.searchString = value)
      );
  }
}

export class ThesaurusEntry extends AbstractWord {
  constructor() {
    super();
  }

  tableName: TableName = "thesaurus";
}

export class CollocationEntry extends AbstractWord {
  constructor() {
    super();
  }

  tableName: TableName = "collocations";
}
