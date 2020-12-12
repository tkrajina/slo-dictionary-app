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

This application is an unofficial offline viewer of the:

* Thesaurus of modern Slovene language <https://viri.cjvt.si/sopomenke/>
* Collocations Dictionary of Modern Slovene <https://viri.cjvt.si/kolokacije/slv/>

The data is published under Creative Commons Attribution-ShareAlike International 4.0.

Thesaurus Authors: Simon Krek, Cyprian Laskowski, Marko Robnik Šikonja, Iztok Kosem, Špela Arhar Holdt, Polona Gantar, Jaka Čibej, Vojko Gorjanc, Bojan Klemenc, Kaja Dobrovoljc

Collocations authors: Iztok Kosem, Polona Gantar, Simon Krek, Špela Arhar Holdt, Jaka Čibej, Cyprian Laskowski, Eva Pori, Bojan Klemenc, Kaja Dobrovoljc, Vojko Gorjanc, Nikola Ljubešić

Read more about on <https://viri.cjvt.si/sopomenke/eng/about> and <https://viri.cjvt.si/kolokacije/slv/about>

# Mobile app

Programming: Tomo Krajina (<http://github.com/tkrajina>)`;
