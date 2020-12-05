import { default as React } from "react";
import { ActivityIndicator, Image, ScrollView, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { BASELINE_CANCEL_24PX, BASELINE_SEARCH_24PX } from "../images_generated";
import { AbstractWord, CollocationEntry, ThesaurusEntry } from "../models/models";
import { stores } from "../stores/RootStore";
import { LAYOUT_STYLES } from "../styles/styles";
import { CleanupContainer } from "../utils/cleanup";
import * as Utils from "../utils/utils";
import { HorizontalLine } from "./HorizontalLine";
import { WordInfo } from "./WordInfo";

const LIMIT = 100;

interface Props {
  searchString: string;
  type: "thesaurus" | "collocations";
}

class State {
  searchString: string = "";
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

  componentDidMount() {
    if (this.props.searchString) {
      this.callbackOnSearchStringAsync(this.props.searchString);
    }
  }

  componentWillUnmount() {
    this.cleanup.cleanup();
  }

  async searchAsync(text: string) {
    text = text.trim().toLowerCase();
    let results: AbstractWord[];
    if (!text) {
      results = [];
    } else if (text.startsWith("=")) {
      results = await stores.dao.query(this.getModelClass(), `where word = ? limit ${LIMIT}`, [text.replace("=", "").trim()]);
    } else {
      // Using > is much faster than "like 'text%'":
      results = await stores.dao.query(this.getModelClass(), `where search_str >= ? limit ${LIMIT}`, [text]);
      results = results.filter(w => w.word.trim().toLowerCase().startsWith(text));
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

  callbackOnClick(w: string) {
    this.callbackOnSearchStringAsync(`=${w}`);
  }

  render() {
    return (
      <React.Fragment>
        <ScrollView>
          {this.state.results.map((word, index) => [
            index > 0 ? <HorizontalLine key={"h" + index} color="#ddd" /> : undefined,
            <WordInfo key={word.id} word={word} long={this.state.results.length == 1} highlight={this.state.searchString.replace("*", "")} onClickWord={this.callbackOnClick.bind(this)} />,
          ])}
        </ScrollView>
        <View style={[LAYOUT_STYLES.directionRow, { borderWidth: 1, borderColor: "#ddd", height: 50, borderRadius: 10 }]}>
          <TextInput
            placeholder="Iskanje"
            value={this.state.searchString}
            onChangeText={this.callbackOnSearchStringAsync.bind(this)}
            style={[LAYOUT_STYLES.flex1, { borderRadius: 10, fontSize: 18, marginHorizontal: 10, marginVertical: 5 }]}
          />
          <TouchableWithoutFeedback onPress={this.callbackOnReset.bind(this)}>
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
