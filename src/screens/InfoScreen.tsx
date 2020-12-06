import { default as React } from "react";
import { AppScreenView } from "../components/AppScreenView";
import { SimplifiedMarkdown } from "../components/SimplifiedMarkdown";
import { CleanupContainer } from "../utils/cleanup";
import * as Utils from "../utils/utils";
import { ScreenProps } from "./common";

export default class InfoScreen extends React.Component<ScreenProps> {
  cleanup = new CleanupContainer();

  constructor(props: ScreenProps) {
    super(props);
    this.props.navigation.addListener("focus", this.willFocus);
    this.props.navigation.addListener("blur", this.didBlur);
    Utils.bindAllPrefixedMethods(this);
  }

  willFocus = async () => {};

  didBlur = () => {
    this.cleanup.cleanup();
  };

  render() {
    return (
      <AppScreenView withDefaultPadding navigation={this.props.navigation} title="Info">
        <SimplifiedMarkdown text={MARKDOWN} />
      </AppScreenView>
    );
  }
}

const MARKDOWN = `# Thesaurus of modern Slovene language

This application is an unofficial offline viewer of the Thesaurus of modern Slovene language available on <https://viri.cjvt.si/sopomenke/>.

The Thesaurus is published under Creative Commons Attribution-ShareAlike International 4.0. Authors: Simon Krek, Cyprian Laskowski, Marko Robnik Šikonja, Iztok Kosem, Špela Arhar Holdt, Polona Gantar, Jaka Čibej, Vojko Gorjanc, Bojan Klemenc, Kaja Dobrovoljc

More information about the Thesaurus: <https://viri.cjvt.si/sopomenke/eng/about>

# Mobile app

Programming: Tomo Krajina (<http://github.com/tkrajina>)`;
