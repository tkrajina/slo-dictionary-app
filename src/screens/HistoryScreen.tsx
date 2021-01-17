import { default as React } from "react";
import { Alert, Button, Image, Text, View } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { AppScreenView } from "../components/AppScreenView";
import { HorizontalLine } from "../components/HorizontalLine";
import { DELETE_24PX, LINK_24PX } from "../images_generated";
import { MESSAGES } from "../localization";
import { CollocationEntry, TableName, ThesaurusEntry } from "../models/models";
import { navigate, push, replace } from "../navigation";
import { Params, Routes, Stacks } from "../routes";
import { stores } from "../stores/RootStore";
import { CleanupContainer } from "../utils/cleanup";
import * as Utils from "../utils/utils";
import { ScreenProps } from "./common";

class State {
  history = stores.history;
}

export default class HistoryScreen extends React.Component<ScreenProps, State> {
  cleanup = new CleanupContainer();

  constructor(props: ScreenProps) {
    super(props);
    this.state = new State();
    this.props.navigation.addListener("focus", this.willFocus);
    this.props.navigation.addListener("blur", this.didBlur);
    Utils.bindAllPrefixedMethods(this);
  }

  willFocus = async () => {
    this.cleanup.triggerObservableStateChanges("history screen", this)
  };

  didBlur = () => {
    this.cleanup.cleanup();
  };

  callbackOnClearHistory() {
    stores.history.set([]);
  }

  callbackOnDeleteFromHistory(n: number) {
    const h = stores.history.get();
    h.splice(n, 1);
    stores.history.set(h);
  }

  async callbackOnNavigateTo(table: TableName, word: string) {
    switch (table) {
      case "collocations": {
          const words = await stores.dao.query(CollocationEntry, "where word=? limit 1", [word])
          navigate(this.props.navigation, Stacks.SEARCH_THESAURUS, Routes.SEARCH_THESAURUS, { [Params.WORD]: words[0] });
          break;
        }
      case "thesaurus": {
          const words = await stores.dao.query(ThesaurusEntry, "where word=? limit 1", [word])
          navigate(this.props.navigation, Stacks.SEARCH_THESAURUS, Routes.SEARCH_THESAURUS, { [Params.WORD]: words[0] });
          break;
        }
    }
  }

  render() {
    return (
      <AppScreenView withDefaultPadding navigation={this.props.navigation} title="History">
        <View style={{ flexDirection: "column", flex: 1 }}>
          <View style={{ flex: 1 }}>
            <ScrollView>
              {this.state.history.get().map((e, index) => <React.Fragment>
                {index > 0 && <HorizontalLine color="#ddd" />}
                <View style={{flexDirection: "row"}}>
                  <View style={{flexDirection: "column", flex: 1}}>
                    <TouchableOpacity onPress={() => this.callbackOnNavigateTo(e[0], e[1])}>
                      <Text style={{fontSize: 12}}>
                        {e[0] === "collocations" && "Collocation:"}
                        {e[0] === "thesaurus" && "Synonyms:"}
                      </Text>
                      <Text style={{marginLeft: 10, fontSize: 16, fontWeight: "bold"}}>{e[1]}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ width: 50 }}>
                    <TouchableOpacity onPress={() => this.callbackOnNavigateTo(e[0], e[1])}>
                      <Image source={LINK_24PX} style={{ opacity: 0.25 }} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ width: 30 }}>
                    <TouchableOpacity onPress={() => this.callbackOnDeleteFromHistory(index)}>
                      <Image source={DELETE_24PX} style={{ opacity: 0.25 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              </React.Fragment>
              )}
            </ScrollView>
          </View>
          <View style={{ height: 40 }}>
            <Button title={`${MESSAGES.clearHistory}`} onPress={this.callbackOnClearHistory} />
          </View>
        </View>
      </AppScreenView>
    );
  }
}