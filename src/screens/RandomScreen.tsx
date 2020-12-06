import { default as React } from "react";
import { ActivityIndicator, Alert, Button, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { AppScreenView } from "../components/AppScreenView";
import { WordInfo } from "../components/WordInfo";
import { AbstractWord, CollocationEntry, ThesaurusEntry } from "../models/models";
import { navigate } from "../navigation";
import { Params, Routes, Stacks } from "../routes";
import { stores } from "../stores/RootStore";
import { CleanupContainer } from "../utils/cleanup";
import { Model } from "../utils/dao";
import * as Utils from "../utils/utils";
import { ScreenProps } from "./common";

class State {
  word: AbstractWord | undefined;
}

// FIXME: Rename this
export default class RandomScreen extends React.Component<ScreenProps, State> {
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
    await this.callbackOnReload(ThesaurusEntry);
  };

  didBlur = () => {
    this.cleanup.cleanup();
  };

  async callbackOnReloadThesaurus() {
    await this.callbackOnReload(ThesaurusEntry);
  }

  async callbackOnReloadCollocation() {
    await this.callbackOnReload(CollocationEntry);
  }

  async callbackOnReload(cls: any) {
    const count = await stores.dao.countAsync(cls as any, "");
    const id = Math.ceil(Math.random() * count);
    const words = await stores.dao.query(cls as any, "where id=? limit 1", [id]);
    this.setState({
      word: (words[0] || new ThesaurusEntry()) as AbstractWord,
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
              {!this.state.word && <ActivityIndicator />}
              {this.state.word && <WordInfo key={`${this.state.word?.tableName()} ${this.state.word?.word}`} word={this.state.word} long={true} onClickWord={this.callbackOnClick} />}
            </ScrollView>
          </View>
          <View style={{ height: 80 }}>
            <Button title="Naključna beseda (sopomenke)" onPress={this.callbackOnReloadThesaurus} />
            <Button title="Naključna beseda (kolokacije)" onPress={this.callbackOnReloadCollocation} />
          </View>
        </View>
      </AppScreenView>
    );
  }
}
