import { default as React } from "react";
import { Alert } from "react-native";
import { AppScreenView } from "../components/AppScreenView";
import SearchScreenView from "../components/SearchScreenView";
import { getParam } from "../navigation";
import { Params } from "../routes";
import { CleanupContainer } from "../utils/cleanup";
import * as Utils from "../utils/utils";
import { ScreenProps } from "./common";

class State {
  searchString: string = "";
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
    const searchString = getParam(this.props.route, Params.SEARCH_STRING);
    if (searchString) {
      this.setState({ searchString: searchString });
    }
  };

  didBlur = () => {
    this.cleanup.cleanup();
  };

  render() {
    return (
      <AppScreenView withDefaultPadding navigation={this.props.navigation} title="Iskanje kolokacij">
        <SearchScreenView searchString={this.state.searchString} type="collocations" navigation={this.props.navigation} />
      </AppScreenView>
    );
  }
}
