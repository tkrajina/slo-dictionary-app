import { StackNavigationProp } from "@react-navigation/stack";
import { default as React } from "react";
import { Image, Platform, SafeAreaView, StatusBar, StyleSheet, Text, View, ViewStyle } from "react-native";
import { SLO } from "../images_generated";
import { Routes } from "../routes";
import { stores } from "../stores/RootStore";
import { CleanupContainer } from "../utils/cleanup";
import * as Utils from "../utils/utils";
import { ErrorBoundary } from "./ErrorBoundary";

interface AppScreenViewProps {
  title: string;
  content?: "scrollview" | "center";
  withDefaultPadding?: boolean;
  navigation: StackNavigationProp<any, any>;
}
class AppScreenViewState {
  keyboardHeight = 0;
}

export class AppScreenView extends React.Component<AppScreenViewProps, AppScreenViewState> {
  cleanup = new CleanupContainer();

  constructor(props: AppScreenViewProps) {
    super(props);
    this.state = new AppScreenViewState();

    Utils.bindAllPrefixedMethods(this);

    this.props.navigation.addListener("focus", this.willFocus.bind(this));
    this.props.navigation.addListener("blur", this.didBlur.bind(this));
  }

  willFocus() {
    const that = this;
    this.cleanup.addObservableListener("keyboard", stores.keyboardHeight, this.callbackOnReloadBottomMargin.bind(this));
  }

  didBlur() {
    this.cleanup.cleanup();
  }

  componentDidMount() {
    if (!this.props.navigation) {
      console.error("navigation not set");
    }
  }

  callbackOnReloadBottomMargin() {
    this.setState({
      keyboardHeight: stores.keyboardHeight.get()
    }, () => {
    });
  }

  callbackOnBack() {
    this.props.navigation.goBack();
  }

  callbackOnNavigation(route: Routes) {
    this.props.navigation.navigate(route);
  }

  render() {
    const style = {...styles.safeAreaView, backgroundColor: "#b9cffb", marginBottom: this.state.keyboardHeight } as ViewStyle;
    return (
      <SafeAreaView style={style}>
        <StatusBar barStyle="dark-content" backgroundColor={"white"} />
        <View style={{ height: StatusBar.currentHeight || 0 /* ??? */ }} />
        <View style={[{ height: 40, paddingHorizontal: 10, flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#999", backgroundColor: "#b9cffb" }]}>
          <Image style={{ alignSelf: "center", opacity: 0.5, width: 50, height: 50, resizeMode: "contain" }} source={SLO} />
          <Text style={{ paddingLeft: 10, paddingTop: 6, alignSelf: "flex-start", fontSize: 20, color: "#333", fontStyle: "italic" }}>{this.props.title}</Text>
        </View>
        <View style={{ flex: 1, padding: this.props.withDefaultPadding ? 10 : undefined, backgroundColor: "white" }}>
          <ErrorBoundary>{this.props.children}</ErrorBoundary>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: "white",
    flex: 1,
    padding: 0,
  } as ViewStyle,
});
