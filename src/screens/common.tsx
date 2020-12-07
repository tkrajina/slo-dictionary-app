import { StackNavigationProp } from "@react-navigation/stack";
import { NavigationRoute } from "react-navigation";
import { RootStore } from "../stores/RootStore";

export interface ScreenProps {
  stores?: RootStore;
  navigation: StackNavigationProp<any, any>;
  route: NavigationRoute;
}
