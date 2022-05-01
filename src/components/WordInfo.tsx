import { StackNavigationProp } from "@react-navigation/stack";
import { default as React } from "react";
import { Image, Text, View, Share, Linking, Alert } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { LINK_24PX, PUBLIC_BLACK_24DP, SHARE_24PX } from "../images_generated";
import { MESSAGES } from "../localization";
import { AbstractWord, CollocationEntry, ThesaurusEntry } from "../models/models";
import { replace } from "../navigation";
import { Params, Routes, Stacks } from "../routes";
import { stores } from "../stores/RootStore";
import { LAYOUT_STYLES } from "../styles/styles";
import * as Toasts from "../utils/toasts";
import * as Utils from "../utils/utils";
import { HorizontalLine } from "./HorizontalLine";
import { Progress } from "./Progress";

interface WordInfoProps {
  word: AbstractWord;
  long: boolean;
  highlight?: string;
  navigation: StackNavigationProp<any, any>;
}
class WordInfoState {
  thesaurusSearchWord: ThesaurusEntry | undefined;
  collocationsSearchWord: CollocationEntry | undefined;
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
        const words = await stores.dao.query(ThesaurusEntry, "where search_str=? limit 1", [searchStr]);
        if (words && words.length > 0) {
          this.setState({ thesaurusSearchWord: words[0] });
        }
      }
      if (!(this.props.word instanceof CollocationEntry)) {
        const words = await stores.dao.query(CollocationEntry, "where search_str=? limit 1", [searchStr]);
        if (words && words.length > 0) {
          this.setState({ collocationsSearchWord: words[0] });
        }
      }
    }
  }

  async callbackOnGotoThesaurusByString(w: string) {
    const words = await stores.dao.query(ThesaurusEntry, "where word=?", [w]);
    if (words && words.length > 0) {
      this.callbackOnGotoWord(words[0]);
    } else {
      Toasts.warning("Not found");
    }
  }

  callbackOnGotoWord(word: AbstractWord) {
    if (word instanceof ThesaurusEntry) {
      replace(this.props.navigation, Stacks.SEARCH_THESAURUS, Routes.SEARCH_THESAURUS, { [Params.WORD]: word });
    } else if (word instanceof CollocationEntry) {
      replace(this.props.navigation, Stacks.SEARCH_COLLOCATIONS, Routes.SEARCH_COLLOCATIONS, { [Params.WORD]: word });
    } else {
      console.error(`Unknown word ${word}`);
    }
  }

  callbackOnShare() {
    Share.share({
      message: this.props.word.word,
    })
  }

  async callbackOnOpenWebsite() {
    let url = `https://viri.cjvt.si/ajax_api/v1/slv/search/sopomenke/${this.props.word.word.toLowerCase()}`;
    if (this.props.word instanceof CollocationEntry) {
      url = `https://viri.cjvt.si/ajax_api/v1/slv/search/kolokacije/${this.props.word.word.toLowerCase()}`;
    }
    try {
      const jsn = await (await fetch(url)).json();
      Linking.openURL(JSON.parse(jsn["json"])["url"]);
    } catch (e) {
      Alert.alert("Error opening link");
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
          <Text style={{ color: "#888", fontSize: 10 }}>{MESSAGES.word}:</Text>
          <View style={LAYOUT_STYLES.directionRow}>
            <View style={LAYOUT_STYLES.flex1}>
              <Text style={{ fontSize: 35, paddingLeft: 20 }}>{this.renderWithHighlight(this.props.word.word)}</Text>
            </View>
            <View style={{flexDirection: "row", paddingTop: 10}}>
              <TouchableOpacity onPress={this.callbackOnOpenWebsite}>
                <Image source={PUBLIC_BLACK_24DP} style={{ opacity: 0.25, marginHorizontal: 3 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={this.callbackOnShare}>
                <Image source={SHARE_24PX} style={{ opacity: 0.25, marginHorizontal: 3 }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={{ marginTop: 5 }}>
          <Text style={{ color: "#888", fontSize: 10 }}>
            {this.props.word instanceof ThesaurusEntry ? `${MESSAGES.synonyms}:` : ""}
            {this.props.word instanceof CollocationEntry ? `${MESSAGES.collocations}:` : ""}
          </Text>
          <HorizontalLine color="#ddd" />
          {this.renderLongWords()}
          {!!this.state.thesaurusSearchWord && <Link word={this.state.thesaurusSearchWord} text={MESSAGES.synonymsOf} italicText={this.state.thesaurusSearchWord.word} onClick={this.callbackOnGotoWord} />}
          {!!this.state.collocationsSearchWord && (
            <Link word={this.state.collocationsSearchWord} text={MESSAGES.collocationsOf} italicText={this.state.collocationsSearchWord.word} onClick={this.callbackOnGotoWord} />
          )}
        </View>
      </React.Fragment>
    );
  }

  renderLongWords() {
    if (this.props.word instanceof ThesaurusEntry) {
      return <LongThesaurus word={this.props.word.word} info={this.infoAsThesaurus()} callbackOnClickWord={this.callbackOnGotoThesaurusByString} />;
    } else if (this.props.word instanceof CollocationEntry) {
      return <LongCollocation word={this.props.word.word} info={this.infoAsCollocation()} />;
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
      <TouchableOpacity onPress={() => this.callbackOnGotoWord(this.props.word)}>
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
        res.push(<Text>{rest}</Text>);
        rest = "";
      } else if (pos === 0) {
        res.push(
          <Text key={rest} style={{ fontWeight: "bold" }}>
            {rest.substr(0, highlight.length)}
          </Text>
        );
        rest = rest.substr(highlight.length);
      } else if (pos > 0) {
        res.push(<Text>{rest.substr(0, pos)}</Text>);
        res.push(
          <Text style={{ fontWeight: "bold" }}>
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
  word: string;
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
            {g1.map((g2, index) => (
              <React.Fragment key={index}>{g2.map((word) => this.renderWord(word))}</React.Fragment>
            ))}
            {g1.length > 0 && <HorizontalLine color="#ddd" />}
          </React.Fragment>
        ))}
      </React.Fragment>
    );
  }

  callbackOnShare(w?: string) {
    if (w) {
      Share.share({
        message: `${this.props.word}: ${w}`,
      })
    } else {
      Share.share({
        message: `${this.props.word}: ${w}`,
      })
    }
  }

  renderWord(word: [number, string]) {
    const score = Math.max(0, Math.min(0.99, word[0] / 0.4));
    const colors = [/*'e', 'd', 'c',*/ "b", "a", "9", "8", "7", "6", "5", "4", "3", "2", "1", "0"]; // TODO: extract
    const color = "#" + colors[Math.trunc(score * colors.length)].repeat(3);
    return (
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: 60, paddingTop: 8 }}>
          <Progress width={55} height={12} percentage={score} color={color} />
        </View>
        <View style={{ flex: 1, padding: 2 }}>
          <TouchableOpacity onPress={() => this.props.callbackOnClickWord(word[1])}>
            <Text style={{ color: color, fontSize: 16 }}>{word[1]}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: 60, flexDirection: "row" }}>
          <TouchableOpacity onPress={() => this.props.callbackOnClickWord(word[1])}>
            <Image source={LINK_24PX} style={{ opacity: 0.25, marginHorizontal: 3 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.callbackOnShare(word[1])}>
            <Image source={SHARE_24PX} style={{ opacity: 0.25, marginHorizontal: 3 }} />
          </TouchableOpacity>
        </View>
      </View>
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
  word: string;
  info: [number, string][][];
}
class LongCollocation extends React.Component<LongCollocationProps> {
  constructor(props: LongCollocationProps) {
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

  callbackOnShare(w: string) {
    Share.share({
      message: `${this.props.word}: ${w}`,
    })
  }

  renderWord(word: [number, string]) {
    const score = Math.max(0, Math.min(0.99, word[0] / 100));
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
          <View style={{ width: 30 }}>
            <TouchableOpacity key={word[1]} onPress={() => this.callbackOnShare(word[1])}>
              <Image source={SHARE_24PX} style={{ opacity: 0.25, marginHorizontal: 3 }} />
            </TouchableOpacity>
          </View>
        </View>
      </React.Fragment>
    );
  }
}

interface LinkProps {
  text: string;
  italicText: string;
  word: AbstractWord;
  onClick: (w: AbstractWord) => void;
}
class Link extends React.Component<LinkProps> {
  constructor(props: LinkProps) {
    super(props);
  }
  render() {
    return (
      <View style={{ flexDirection: "row", padding: 10 }}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => this.props.onClick(this.props.word)}>
            <Text style={{ color: "#005be5", fontSize: 18 }}>
              {this.props.text} <Text style={{ fontStyle: "italic", fontWeight: "bold" }}>{this.props.italicText}</Text>
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: 30 }}>
          <Image source={LINK_24PX} style={{ opacity: 0.25 }} />
        </View>
      </View>
    );
  }
}
