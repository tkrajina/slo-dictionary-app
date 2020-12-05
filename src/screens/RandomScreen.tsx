import { default as React } from "react";
import { Button, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { AppScreenView } from "../components/AppScreenView";
import { WordInfo } from "../components/WordInfo";
import { ThesaurusEntry } from "../models/models";
import { navigate } from "../navigation";
import { Params, Routes, Stacks } from "../routes";
import { stores } from "../stores/RootStore";
import { CleanupContainer } from "../utils/cleanup";
import * as Utils from "../utils/utils";
import { ScreenProps } from "./common";

class State {
  word: ThesaurusEntry = new ThesaurusEntry();
}

// FIXME: Rename this
export default class RandomScreen extends React.Component<ScreenProps, State> {
  static navigationOptions = {
    title: "Random",
  };

  cleanup = new CleanupContainer();

  constructor(props: ScreenProps) {
    super(props);
    this.state = new State();
    this.props.navigation.addListener("focus", this.willFocus);
    this.props.navigation.addListener("blur", this.didBlur);
    Utils.bindAllPrefixedMethods(this);
  }

  async componentDidMount() {
    this.setState({});
  }

  willFocus = async () => {
    await this.callbackOnReload();
  };

  didBlur = () => {
    this.cleanup.cleanup();
  };

  async callbackOnReload() {
    const count = await stores.dao.countAsync(ThesaurusEntry, "");
    const n = Math.ceil(Math.random() * count);
    const words = await stores.dao.query(ThesaurusEntry, "where number=? limit 1", [n]);
    this.setState({
      word: words[0] || new ThesaurusEntry(),
    });
  }

  callbackOnClick(w: string) {
    navigate(this.props.navigation, Stacks.SEARCH_THESAURUS, Routes.SEARCH_THESAURUS, { [Params.SEARCH_STRING]: `=${w}` });
  }

  render() {
    return (
      <AppScreenView withDefaultPadding navigation={this.props.navigation} title="Naključna beseda">
        <View style={{ flexDirection: "column", flex: 1 }}>
          <View style={{ flex: 1 }}>
            <ScrollView>
              <WordInfo word={this.state.word} long={true} onClickWord={this.callbackOnClick} />
            </ScrollView>
          </View>
          <View style={{ height: 40 }}>
            <Button title="Naslednja beseda" onPress={this.callbackOnReload} />
          </View>
        </View>
      </AppScreenView>
    );
  }
}
