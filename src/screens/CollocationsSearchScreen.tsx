import { default as React } from "react";
import { AppScreenView } from "../components/AppScreenView";
import SearchScreenView from "../components/SearchScreenView";
import { AbstractWord } from "../models/models";
import { getParam } from "../navigation";
import { Params } from "../routes";
import { CleanupContainer } from "../utils/cleanup";
import * as Utils from "../utils/utils";
import { ScreenProps } from "./common";

class State {
  initialWord: AbstractWord | undefined;
}

export default class CollocationsSearchScreen extends React.Component<ScreenProps, State> {
  cleanup = new CleanupContainer();

  constructor(props: ScreenProps) {
    super(props);
    this.state = new State();
    this.props.navigation.addListener("focus", this.willFocus);
    this.props.navigation.addListener("blur", this.didBlur);
    Utils.bindAllPrefixedMethods(this);
  }

  willFocus = async () => {
    const word = getParam(this.props.route, Params.WORD);
    if (word) {
      this.setState({
        initialWord: word
      });
    }
  };

  didBlur = () => {
    this.cleanup.cleanup();
  };

  render() {
    return (
      <AppScreenView withDefaultPadding navigation={this.props.navigation} title="Iskanje kolokacij">
        <SearchScreenView key={`collocations/${this.state.initialWord?.id}`} word={this.state.initialWord} type="collocations" navigation={this.props.navigation} emptyText="Kolokacije so besedne zveze, ki niso več naključne, ampak so kot take že ustaljene v jeziku." />
      </AppScreenView>
    );
  }
}
