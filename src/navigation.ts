import { NavigationRoute, NavigationScreenProp } from "react-navigation";
import { Params, Routes, Stacks } from "./routes";

export function navigate(navigation: NavigationScreenProp<any, any>, stack: Stacks, route: Routes, params: any) {
  const p = { screen: route, params: params };
  console.log(`nav to ${stack} with ${JSON.stringify(p)}`);
  return navigation.navigate(stack, p);
}

export function getParam(route: NavigationRoute, param: Params) {
  if (!route.params) {
    return undefined;
  }
  return route.params[param];
}
