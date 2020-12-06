import { default as React } from "react";
import { Button, Image, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { LINK_24PX } from "../images_generated";
import { AbstractWord, CollocationEntry, ThesaurusEntry } from "../models/models";
import { stores } from "../stores/RootStore";
import * as Utils from "../utils/utils";
import { HorizontalLine } from "./HorizontalLine";
import { Progress } from "./Progress";

interface WordInfoProps {
  word: AbstractWord;
  long: boolean;
  highlight?: string;
  onClickWord: (word: string) => void;
}
class WordInfoState {
  thesaurusSearchWord: string = "";
  collocationsSearchWord: string = "";
}
export class WordInfo extends React.Component<WordInfoProps, WordInfoState> {
  constructor(props: WordInfoProps) {
    super(props);
    this.state = new WordInfoState();
    Utils.bindAllPrefixedMethods(this);
  }

  async componentDidMount() {
    if (this.props.long) {
      const searchStr = this.props.word.word.toLowerCase();
      if (!(this.props.word instanceof ThesaurusEntry)) {
        const count = await stores.dao.countAsync(ThesaurusEntry, "where search_str=?", [searchStr]);
        if (count > 0) {
          this.setState({ thesaurusSearchWord: searchStr });
        }
      }
      if (!(this.props.word instanceof CollocationEntry)) {
        const count = await stores.dao.countAsync(CollocationEntry, "where search_str=?", [searchStr]);
        if (count > 0) {
          this.setState({ collocationsSearchWord: searchStr });
        }
      }
    }
  }

  callbackOnClickWord(word: string) {
    if (this.props.onClickWord) {
      this.props.onClickWord(word);
    }
  }

  render() {
    if (this.props.long) {
      return this.renderLong();
    }
    return this.renderShort();
  }

  renderLong() {
    return (
      <React.Fragment>
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: "#888", fontSize: 10 }}>Beseda:</Text>
          <Text style={{ fontSize: 40, paddingLeft: 20 }}>{this.renderWithHighlight(this.props.word.word)}</Text>
        </View>
        <View style={{ marginTop: 5 }}>
          <Text style={{ color: "#888", fontSize: 10 }}>
            {this.props.word instanceof ThesaurusEntry ? "Sopomenke:" : ""}
            {this.props.word instanceof CollocationEntry ? "Kolokacije:" : ""}
          </Text>
          <HorizontalLine color="#ddd" />
          {this.renderLongWords()}
          {!!this.state.thesaurusSearchWord && <Link word={this.props.word} text={`Sopomenke od "${this.props.word?.word}"`} onClick={(w) => {}} />}
          {!!this.state.collocationsSearchWord && <Link word={this.props.word} text={`Kolokacije od "${this.props.word?.word}"`} onClick={(w) => {}} />}
        </View>
      </React.Fragment>
    );
  }

  renderLongWords() {
    if (this.props.word instanceof ThesaurusEntry) {
      return <LongThesaurus info={this.infoAsThesaurus()} callbackOnClickWord={this.callbackOnClickWord} />;
    } else if (this.props.word instanceof CollocationEntry) {
      return <LongCollocation info={this.infoAsCollocation()} />;
    }
    return <Text>Unknown: {JSON.stringify(this.props.word.info())}</Text>;
  }

  infoAsThesaurus() {
    return this.props.word.info() as [number, string][][][];
  }

  infoAsCollocation() {
    return this.props.word.info() as [number, string][][];
  }

  renderShort() {
    return (
      <TouchableOpacity onPress={() => this.callbackOnClickWord(this.props.word.word)}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20 }}>{this.renderWithHighlight(this.props.word.word)}:</Text>
            <Text style={{ paddingLeft: 10, fontStyle: "italic" }}>{this.renderShortWords()}</Text>
          </View>
          <View style={{ width: 30 }}>
            <Image source={LINK_24PX} style={{ opacity: 0.25 }} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  renderShortWords() {
    if (this.props.word instanceof ThesaurusEntry) {
      return <ShortThesaurus info={this.infoAsThesaurus()} />;
    } else if (this.props.word instanceof CollocationEntry) {
      return <ShortCollocation info={this.infoAsCollocation()} />;
    }
    return <Text>Unknown: {JSON.stringify(this.props.word.info())}</Text>;
  }

  renderWithHighlight(text: string) {
    const highlight = this.props.highlight ? this.props.highlight.toLowerCase() : "";
    if (!highlight) {
      return <Text>{text}</Text>;
    }

    const res = [];
    let rest = text;
    while (rest) {
      let pos = rest.toLowerCase().indexOf(highlight);
      if (pos < 0) {
        res.push(<Text key={rest}>{rest}</Text>);
        rest = "";
      } else if (pos === 0) {
        res.push(
          <Text key={rest} style={{ fontWeight: "bold" }}>
            {rest.substr(0, highlight.length)}
          </Text>
        );
        rest = rest.substr(highlight.length);
      } else if (pos > 0) {
        res.push(<Text key={rest + "1"}>{rest.substr(0, pos)}</Text>);
        res.push(
          <Text key={rest + "2"} style={{ fontWeight: "bold" }}>
            {rest.substr(pos, highlight.length)}
          </Text>
        );
        rest = rest.substr(pos + highlight.length);
      }
    }
    return res;
  }
}

interface LongThesaurusProps {
  info: [number, string][][][];
  callbackOnClickWord: (word: string) => void;
}
class LongThesaurus extends React.Component<LongThesaurusProps> {
  constructor(props: LongThesaurusProps) {
    super(props);
  }
  render() {
    if (!this.props.info) {
      return null;
    }
    return (
      <React.Fragment>
        {this.props.info.map((g1) => (
          <React.Fragment>
            {g1.map((g2) => (
              <React.Fragment>{g2.map((word) => this.renderWord(word))}</React.Fragment>
            ))}
            {g1.length > 0 && <HorizontalLine color="#ddd" />}
          </React.Fragment>
        ))}
      </React.Fragment>
    );
  }

  renderWord(word: [number, string]) {
    const score = Math.max(0, Math.min(0.99, word[0] / 0.4));
    const colors = [/*'e', 'd', 'c',*/ "b", "a", "9", "8", "7", "6", "5", "4", "3", "2", "1", "0"]; // TODO: extract
    const color = "#" + colors[Math.trunc(score * colors.length)].repeat(3);
    return (
      <TouchableOpacity onPress={() => this.props.callbackOnClickWord(word[1])}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: 60, paddingTop: 8 }}>
            <Progress width={55} height={12} percentage={score} color={color} />
          </View>
          <View style={{ flex: 1, padding: 2 }}>
            <Text style={{ color: color, fontSize: 16 }}>{word[1]}</Text>
          </View>
          <View style={{ width: 30 }}>
            <Image source={LINK_24PX} style={{ opacity: 0.25 }} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

interface ShortThesaurusProps {
  info: [number, string][][][];
}
class ShortThesaurus extends React.Component<ShortThesaurusProps> {
  constructor(props: ShortThesaurusProps) {
    super(props);
  }
  render() {
    let words: string[] = [];
    for (const g1 of this.props.info) {
      for (const g2 of g1) {
        for (const word of g2) {
          words.push(word[1]);
        }
      }
    }
    if (words.length > 5) {
      words = words.slice(0, 5);
    }

    return (
      <React.Fragment>
        {words.map((w, _index) => (
          <Text key={`${w}`}>{w}, </Text>
        ))}{" "}
        ...
      </React.Fragment>
    );
  }
}

interface ShortCollocationProps {
  info: [number, string][][];
}
class ShortCollocation extends React.Component<ShortCollocationProps> {
  constructor(props: ShortCollocationProps) {
    super(props);
  }
  render() {
    const collocations: string[] = [];
    for (const group of this.props.info) {
      for (const group2 of group) {
        if (collocations.length <= 2) {
          collocations.push(group2[1]);
        }
      }
    }
    return (
      <Text>
        {collocations.map((c) => (
          <Text>{c}, </Text>
        ))}
        ...
      </Text>
    );
  }
}

interface LongCollocationProps {
  info: [number, string][][];
}
class LongCollocation extends React.Component<LongCollocationProps> {
  constructor(props: ShortCollocationProps) {
    super(props);
  }
  render() {
    if (!this.props.info) {
      return null;
    }
    return (
      <React.Fragment>
        {this.props.info.map((g1, n) => (
          <React.Fragment key={n}>
            {g1.map((g2) => this.renderWord(g2))}
            {g1.length > 0 && <HorizontalLine color="#ddd" />}
          </React.Fragment>
        ))}
      </React.Fragment>
    );
  }

  renderWord(word: [number, string]) {
    const score = Math.max(0, Math.min(0.99, word[0] / 150));
    const colors = [/*'e', 'd', 'c',*/ "b", "a", "9", "8", "7", "6", "5", "4", "3", "2", "1", "0"]; // TODO: extract
    const color = "#" + colors[Math.trunc(score * colors.length)].repeat(3);
    return (
      <React.Fragment key={word[1]}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: 60, paddingTop: 8 }}>
            <Progress width={55} height={12} percentage={score} color={color} />
          </View>
          <View style={{ flex: 1, padding: 2 }}>
            <Text style={{ color: color, fontSize: 16 }}>{word[1]}</Text>
          </View>
        </View>
      </React.Fragment>
    );
  }
}

interface LinkProps {
  text: string;
  word: AbstractWord;
  onClick: (w: AbstractWord) => void;
}
class Link extends React.Component<LinkProps> {
  constructor(props: LinkProps) {
    super(props);
  }
  render() {
    return (
      <TouchableOpacity onPress={() => this.props.onClick(this.props.word)}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <Text>{this.props.text}</Text>
          </View>
          <View style={{ width: 30 }}>
            <Image source={LINK_24PX} style={{ opacity: 0.25 }} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}
