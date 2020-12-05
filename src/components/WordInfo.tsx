import { default as React } from "react";
import { Image, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { LINK_24PX } from "../images_generated";
import { AbstractWord } from "../models/models";
import * as Utils from "../utils/utils";
import { HorizontalLine } from "./HorizontalLine";
import { Progress } from "./Progress";

interface WordInfoProps {
  word: AbstractWord;
  long: boolean;
  highlight?: string;
  onClickWord: (word: string) => void;
}
//class WordInfoState {}
export class WordInfo extends React.PureComponent<WordInfoProps /*, WordInfoState*/> {
  constructor(props: WordInfoProps) {
    super(props);
    Utils.bindAllPrefixedMethods(this);
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
    const info = this.props.word.info();
    return (
      <React.Fragment>
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: "#888", fontSize: 10 }}>Beseda:</Text>
          <Text style={{ fontSize: 40, paddingLeft: 20 }}>{this.renderWithHighlight(this.props.word.word)}</Text>
        </View>
        <View style={{ marginTop: 5 }}>
          <Text style={{ color: "#888", fontSize: 10 }}>Sopomenke:</Text>
          <HorizontalLine color="#ddd" />
          {this.renderWords(info as [number, string][][][])}
        </View>
      </React.Fragment>
    );
  }

  renderWords(wordsGroup: [number, string][][][]) {
    if (!wordsGroup) {
      return null;
    }
    return (
      <React.Fragment>
        {wordsGroup.map((g1) => (
          <React.Fragment>
            {g1.map(g2 => <React.Fragment>
              {g2.map(word => this.renderWord(word))}
</React.Fragment>
              )}
            {g1.length > 0 && <HorizontalLine color="#ddd" />}
          </React.Fragment>
        ))}
      </React.Fragment>
    );
  }

  renderWord(word: [number, string]) {
    const score = Math.max(0, Math.min(0.99, word[0] / 0.4));
    const colors = [/*'e', 'd', 'c',*/ "b", "a", "9", "8", "7", "6", "5", "4", "3", "2", "1", "0"];
    const color = "#" + colors[Math.trunc(score * colors.length)].repeat(3);
    return (
      <TouchableOpacity onPress={() => this.callbackOnClickWord(word[1])}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: 60, paddingTop: 8 }}>
            <Progress width={55} height={12} percentage={score} color={color} />
          </View>
          <View style={{ flex: 1, padding: 2 }}>
            <Text style={{ color: color, fontSize: 16 }}>{word[1]}</Text>
          </View>
          <View style={{width: 30}}>
            <Image source={LINK_24PX} style={{opacity: 0.25}} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  infoAsThesaurus() {
    return this.props.word.info() as [number, string][][][];
  }

  infoAsCollocation() {
    return this.props.word.info() as any;
  }

  renderShort() {
    const info = this.infoAsThesaurus();
    let words: string[] = [];
    for (const g1 of info) {
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
      <TouchableOpacity onPress={() => this.callbackOnClickWord(this.props.word.word)}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20 }}>{this.renderWithHighlight(this.props.word.word)}:</Text>
            <Text style={{ paddingLeft: 10, fontStyle: "italic" }}>
              {words.map((w, _index) => (
                <Text key={`${w}`}>{w}, </Text>
              ))}{" "}
              ...
            </Text>
          </View>
          <View style={{ width: 30 }}>
            <Image source={LINK_24PX} style={{ opacity: 0.25 }} />
          </View>
        </View>
      </TouchableOpacity>
    );
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
