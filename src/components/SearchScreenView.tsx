import { StackNavigationProp } from "@react-navigation/stack";
import { default as React } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { BASELINE_CANCEL_24PX, BASELINE_SEARCH_24PX } from "../images_generated";
import { MESSAGES } from "../localization";
import { AbstractWord, CollocationEntry, ThesaurusEntry } from "../models/models";
import { stores } from "../stores/RootStore";
import { LAYOUT_STYLES } from "../styles/styles";
import { CleanupContainer } from "../utils/cleanup";
import * as Utils from "../utils/utils";
import { HorizontalLine } from "./HorizontalLine";
import { SimplifiedMarkdown } from "./SimplifiedMarkdown";
import { WordInfo } from "./WordInfo";

const LIMIT = 100;

interface Props {
  word?: AbstractWord;
  noResultsMarkdown: string;
  type: "thesaurus" | "collocations";
  navigation: StackNavigationProp<any, any>;
}

class State {
  initialized = false;
  searchString: string | undefined;
  searching = false;
  results: AbstractWord[] = [];
}

export default abstract class SearchScreenView extends React.Component<Props, State> {
  cleanup = new CleanupContainer();

  constructor(props: Props) {
    super(props);
    this.state = new State();
    Utils.bindAllPrefixedMethods(this);
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State): State | null {
    if (prevState.initialized) {
      return null;
    }
    if (nextProps.word && prevState.results.length == 0) {
      prevState.initialized = true;
      prevState.results.push(nextProps.word);
      prevState.searchString = `=${nextProps.word.searchString}`;
      return prevState;
    }
    return null;
  }

  getModelClass() {
    switch (this.props.type) {
      case "collocations":
        return CollocationEntry;
      case "thesaurus":
        return ThesaurusEntry;
      default:
        return ThesaurusEntry; // TODO: Error
    }
  }

  componentWillUnmount() {
    this.cleanup.cleanup();
  }

  async searchAsync(text: string) {
    if (!text || !text.trim()) {
      this.setState({
        results: [],
        searching: false,
      });
      return;
    }
    text = text.trim().toLowerCase();
    let results: AbstractWord[];
    if (!text) {
      results = [];
    } else if (text.startsWith("=")) {
      results = await stores.dao.query(this.getModelClass(), `where word = ? limit ${LIMIT}`, [text.replace("=", "").trim()]);
    } else {
      // Using > is much faster than "like 'text%'":
      results = await stores.dao.query(this.getModelClass(), `where search_str >= ? limit ${LIMIT}`, [text]);
      results = results.filter((w) => w.word.trim().toLowerCase().startsWith(text));
    }
    this.setState({
      results: results,
      searching: false,
    });
  }

  timeout: any;

  async callbackOnSearchStringAsync(text: string) {
    this.setState({
      searchString: text,
      searching: true,
    });
    clearTimeout(this.timeout);
    this.timeout = this.cleanup.setTimeout(() => this.searchAsync(text), 1000);
  }

  private callbackOnReset() {
    this.setState({
      searchString: "",
      searching: false,
      results: [],
    });
  }

  render() {
    let emptyText = this.props.noResultsMarkdown;
    if (this.state.searching) {
      emptyText = "";
    } else if (this.state.searchString) {
      emptyText = MESSAGES.nothingFound;;
    }

    return (
      <React.Fragment>
        <ScrollView>
          {this.state.results.length == 0 && (
            <View style={{ paddingHorizontal: 30,  }}>
              <SimplifiedMarkdown fontScale={1.5} text={emptyText} />
            </View>
          )}
          {this.state.searching && <ActivityIndicator />}
          {this.state.results.map((word, index) => [
            index > 0 ? <HorizontalLine key={"h" + index} color="#ddd" /> : undefined,
            <WordInfo
              key={`${this.props.type} ${word.id} ${this.state.results.length == 1}`}
              word={word}
              long={this.state.results.length == 1}
              highlight={(this.state.searchString || "").replace("*", "")}
              navigation={this.props.navigation}
            />,
          ])}
        </ScrollView>
        <View style={[LAYOUT_STYLES.directionRow, { borderWidth: 1, borderColor: "#ddd", height: 50, borderRadius: 10 }]}>
          <TextInput
            placeholder={MESSAGES.search}
            value={this.state.searchString}
            onChangeText={this.callbackOnSearchStringAsync.bind(this)}
            style={[LAYOUT_STYLES.flex1, { borderRadius: 10, fontSize: 18, marginHorizontal: 10, marginVertical: 5 }]}
          />
          <TouchableWithoutFeedback onPress={this.callbackOnReset}>
            <View style={[LAYOUT_STYLES.centerContent, { width: 40 }]}>
              <View style={[LAYOUT_STYLES.centerSelf, { opacity: 0.5 }]}>
                {this.state.searching && <ActivityIndicator size="small" color="#aaa" />}
                {!this.state.searching && (this.state.searchString ? <Image source={BASELINE_CANCEL_24PX} /> : <Image source={BASELINE_SEARCH_24PX} />)}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </React.Fragment>
    );
  }
}
