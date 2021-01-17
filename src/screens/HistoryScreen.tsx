import { default as React } from "react";
import { Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { AppScreenView } from "../components/AppScreenView";
import { SimplifiedMarkdown } from "../components/SimplifiedMarkdown";
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

  render() {
    return (
      <AppScreenView withDefaultPadding navigation={this.props.navigation} title="History">
        <ScrollView>
          <SimplifiedMarkdown text={"# History"} />
          <Text>{JSON.stringify(stores.history.get())}</Text>
        </ScrollView>
      </AppScreenView>
    );
  }
}