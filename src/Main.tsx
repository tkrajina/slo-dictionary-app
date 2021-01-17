import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { Image, Text } from "react-native";
import { SafeAreaView } from "react-navigation";
import { Center } from "./components/Center";
import { AUTORENEW_24PX, BASELINE_FORMAT_LIST_BULLETED_24PX, BASELINE_INFO_24PX, BASELINE_SEARCH_24PX } from "./images_generated";
import { MESSAGES } from "./localization";
import { Routes, Stacks } from "./routes";
import CollocationsSearchScreen from "./screens/CollocationsSearchScreen";
import HistoryScreen from "./screens/HistoryScreen";
import InfoScreen from "./screens/InfoScreen";
import RandomScreen from "./screens/RandomScreen";
import ThesaurusSearchScreen from "./screens/ThesaurusSearchScreen";
import { stores } from "./stores/RootStore";
import { CleanupContainer } from "./utils/cleanup";
import * as Errors from "./utils/errors";

Errors.initGlobalErrorHandler(console.error);

class AppState {
  ready = stores.ready;
}

class Main extends React.Component<any, AppState> {
  cleanup = new CleanupContainer();

  constructor(props: any) {
    super(props);
    this.state = new AppState();
  }

  async componentDidMount() {
    this.cleanup.triggerObservableStateChanges("app", this);
    this.onAppStarted();
  }

  private onAppStarted() {}

  async componentWillUnmount() {
    this.cleanup.cleanup();
  }

  render() {
    if (!this.state.ready.get()) {
      return (
        <SafeAreaView style={{ marginTop: 100 }}>
          <Center>
            <Text>loading...</Text>
          </Center>
        </SafeAreaView>
      );
    }

    return (
      <NavigationContainer>
        <MainStackNavigator.Navigator headerMode="none">
          <MainStackNavigator.Screen name="root" component={BottomTabs} initialParams={{}} />
        </MainStackNavigator.Navigator>
      </NavigationContainer>
    );
  }
}

const MainStackNavigator = createStackNavigator();

const BottomTabNavigator = createBottomTabNavigator();

function BottomTabs(props: {}) {
  return (
    <BottomTabNavigator.Navigator
      tabBarOptions={{
        inactiveTintColor: "#bbb",
        activeTintColor: "black",
        keyboardHidesTabBar: true,
        // keyboardHidesTabBar: true,
        tabStyle: { paddingTop: 5, paddingBottom: 5 },
      }}
    >
      <BottomTabNavigator.Screen
        name={Stacks.SEARCH_THESAURUS}
        component={ThesaurusStack}
        options={{
          tabBarLabel: MESSAGES.thesaurus,
          tabBarIcon: ({ focused, color, size }) => <Image style={{ alignSelf: "center", opacity: focused ? 1 : 0.3 }} source={BASELINE_SEARCH_24PX} />,
        }}
      />
      <BottomTabNavigator.Screen
        name={Stacks.SEARCH_COLLOCATIONS}
        component={CollocationsStack}
        options={{
          tabBarLabel: MESSAGES.collocations,
          tabBarIcon: ({ focused, color, size }) => <Image style={{ alignSelf: "center", opacity: focused ? 1 : 0.3 }} source={BASELINE_SEARCH_24PX} />,
        }}
      />
      <BottomTabNavigator.Screen
        name={Stacks.HISTORY}
        component={HistoryStack}
        options={{
          tabBarLabel: MESSAGES.history,
          tabBarIcon: ({ focused, color, size }) => <Image style={{ alignSelf: "center", opacity: focused ? 1 : 0.3 }} source={BASELINE_FORMAT_LIST_BULLETED_24PX} />,
        }}
      />
      <BottomTabNavigator.Screen
        name={Stacks.RANDOM}
        component={RandomStack}
        options={{
          tabBarLabel: MESSAGES.randomWord,
          tabBarIcon: ({ focused, color, size }) => <Image style={{ alignSelf: "center", opacity: focused ? 1 : 0.3 }} source={AUTORENEW_24PX} />,
        }}
      />
      <BottomTabNavigator.Screen
        name={Stacks.INFO}
        component={InfoStack}
        options={{
          tabBarLabel: MESSAGES.info,
          tabBarIcon: ({ focused, color, size }) => <Image style={{ alignSelf: "center", opacity: focused ? 1 : 0.3 }} source={BASELINE_INFO_24PX} />,
        }}
      />
    </BottomTabNavigator.Navigator>
  );
}

const ThesaurusStackNavigator = createStackNavigator();
function ThesaurusStack(props: {}) {
  return (
    <ThesaurusStackNavigator.Navigator headerMode="none">
      <ThesaurusStackNavigator.Screen name={Routes.SEARCH_THESAURUS} component={ThesaurusSearchScreen} />
    </ThesaurusStackNavigator.Navigator>
  );
}

const CollocationsStackNavigator = createStackNavigator();
function CollocationsStack(props: {}) {
  return (
    <CollocationsStackNavigator.Navigator headerMode="none">
      <CollocationsStackNavigator.Screen name={Routes.SEARCH_COLLOCATIONS} component={CollocationsSearchScreen} />
    </CollocationsStackNavigator.Navigator>
  );
}

const InfoStackNavigator = createStackNavigator();
function InfoStack(props: {}) {
  return (
    <InfoStackNavigator.Navigator headerMode="none">
      <InfoStackNavigator.Screen name={Routes.INFO} component={InfoScreen} />
    </InfoStackNavigator.Navigator>
  );
}

const RandomStackNavigator = createStackNavigator();
function RandomStack(props: {}) {
  return (
    <RandomStackNavigator.Navigator headerMode="none">
      <RandomStackNavigator.Screen name={Routes.RANDOM} component={RandomScreen} />
    </RandomStackNavigator.Navigator>
  );
}

const HistoryStackNavigator = createStackNavigator();
function HistoryStack(props: {}) {
  return (
    <HistoryStackNavigator.Navigator headerMode="none">
      <HistoryStackNavigator.Screen name={Routes.HISTORY} component={HistoryScreen} />
    </HistoryStackNavigator.Navigator>
  );
}

export default Main;
