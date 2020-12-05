import { NavigationRoute, NavigationScreenProp } from "react-navigation";
import { RootStore } from "../stores/RootStore";

export interface ScreenProps {
  stores?: RootStore;
  navigation: NavigationScreenProp<any, any>;
  route: NavigationRoute;
}
