import { default as React } from "react";
import { ActivityIndicator, Button, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { AppScreenView } from "../components/AppScreenView";
import { WordInfo } from "../components/WordInfo";
import { MESSAGES } from "../localization";
import { AbstractWord, CollocationEntry, ThesaurusEntry } from "../models/models";
import { stores } from "../stores/RootStore";
import { CleanupContainer } from "../utils/cleanup";
import * as Utils from "../utils/utils";
import { ScreenProps } from "./common";

class State {
  word: AbstractWord | undefined;
}

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

  render() {
    return (
      <AppScreenView withDefaultPadding navigation={this.props.navigation} title={MESSAGES.randomWord}>
        <View style={{ flexDirection: "column", flex: 1 }}>
          <View style={{ flex: 1 }}>
            <ScrollView>
              {!this.state.word && <ActivityIndicator />}
              {this.state.word && <WordInfo key={`${this.state.word?.tableName} ${this.state.word?.word}`} word={this.state.word} long={true} navigation={this.props.navigation} />}
            </ScrollView>
          </View>
          <View style={{ height: 80 }}>
            <Button title={`${MESSAGES.randomWord} (${MESSAGES.thesaurus})`} onPress={this.callbackOnReloadThesaurus} />
            <View style={{ marginVertical: 5 }}></View>
            <Button title={`${MESSAGES.randomWord} (${MESSAGES.collocations})`} onPress={this.callbackOnReloadCollocation} />
          </View>
        </View>
      </AppScreenView>
    );
  }
}
