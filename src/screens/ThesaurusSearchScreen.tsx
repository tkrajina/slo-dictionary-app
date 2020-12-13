import { default as React } from "react";
import { AppScreenView } from "../components/AppScreenView";
import SearchScreenView from "../components/SearchScreenView";
import { AbstractWord } from "../models/models";
import { getParam } from "../navigation";
import { Params } from "../routes";
import { CleanupContainer } from "../utils/cleanup";
import * as Utils from "../utils/utils";
import { ScreenProps } from "./common";

class SearchScreenState {
  initialWord: AbstractWord | undefined;
}

export default class ThesaurusSearchScreen extends React.Component<ScreenProps, SearchScreenState> {
  cleanup = new CleanupContainer();

  constructor(props: ScreenProps) {
    super(props);
    this.state = new SearchScreenState();
    this.props.navigation.addListener("focus", this.willFocus);
    this.props.navigation.addListener("blur", this.didBlur);
    Utils.bindAllPrefixedMethods(this);
  }

  willFocus = async () => {
    const word = getParam(this.props.route, Params.WORD);
    if (word) {
      this.setState({ initialWord: word });
    }
  };

  didBlur = () => {
    this.cleanup.cleanup();
  };

  render() {
    return (
      <AppScreenView withDefaultPadding navigation={this.props.navigation} title="Iskanje sopomenk">
        <SearchScreenView
          key={`thesaurus/${this.state.initialWord?.id}`}
          word={this.state.initialWord}
          type="thesaurus"
          navigation={this.props.navigation}
          noResultsMarkdown="**Sopomenka** (sinonim) je beseda, ki ima skoraj enak pomen kot kaka druga beseda."
        />
      </AppScreenView>
    );
  }
}
