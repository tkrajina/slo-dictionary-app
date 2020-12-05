import { default as React } from "react";
import { ActivityIndicator, Image, ScrollView, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { AppScreenView } from "../components/AppScreenView";
import { HorizontalLine } from "../components/HorizontalLine";
import { WordInfo } from "../components/WordInfo";
import { BASELINE_CANCEL_24PX, BASELINE_SEARCH_24PX } from "../images_generated";
import { ThesaurusEntry } from "../models/models";
import { getParam } from "../navigation";
import { Params } from "../routes";
import { stores } from "../stores/RootStore";
import { LAYOUT_STYLES } from "../styles/styles";
import { CleanupContainer } from "../utils/cleanup";
import * as Utils from "../utils/utils";
import { ScreenProps } from "./common";

const LIMIT = 100;

class SearchScreenState {
  searchString: string = "";
  searching = false;
  results: ThesaurusEntry[] = [];
}

// FIXME: Rename this
export default class SearchScreen extends React.Component<ScreenProps, SearchScreenState> {
  cleanup = new CleanupContainer();

  constructor(props: ScreenProps) {
    super(props);
    this.state = new SearchScreenState();
    this.props.navigation.addListener("focus", this.willFocus);
    this.props.navigation.addListener("blur", this.didBlur);
    Utils.bindAllPrefixedMethods(this);
  }

  willFocus = async () => {
    const searchString = getParam(this.props.route, Params.SEARCH_STRING);
    if (searchString) {
      this.callbackOnSearchStringAsync(searchString);
    }
  };

  didBlur = () => {
    this.cleanup.cleanup();
  };

  async searchAsync(text: string) {
    text = text.trim().toLowerCase();
    let results: ThesaurusEntry[];
    if (!text) {
      results = [];
    } else if (text.startsWith("=")) {
      results = await stores.dao.query(ThesaurusEntry, `where word = ? limit ${LIMIT}`, [text.replace("=", "").trim()]);
    } else {
      // Using > is much faster than "like 'text%'":
      results = await stores.dao.query(ThesaurusEntry, `where search_str >= ? limit ${LIMIT}`, [text]);
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
      <AppScreenView withDefaultPadding navigation={this.props.navigation} title="Iskanje sopomenk">
        <ScrollView>
          {this.state.results.map((word, index) => [
            index > 0 ? <HorizontalLine key={"h" + index} color="#ddd" /> : undefined,
            <WordInfo key={word.id} word={word} long={this.state.results.length == 1} highlight={this.state.searchString.replace("*", "")} onClickWord={this.callbackOnClick} />,
          ])}
        </ScrollView>
        <View style={[LAYOUT_STYLES.directionRow, { borderWidth: 1, borderColor: "#ddd", height: 50, borderRadius: 10 }]}>
          <TextInput
            placeholder="Iskanje"
            value={this.state.searchString}
            onChangeText={this.callbackOnSearchStringAsync}
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
      </AppScreenView>
    );
  }
}
