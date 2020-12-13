import { StackNavigationProp } from "@react-navigation/stack";
import { NavigationRoute } from "react-navigation";
import { Params, Routes, Stacks } from "./routes";

export function replace(navigation: StackNavigationProp<any, any>, stack: Stacks, route: Routes, params: any) {
  return navigation.replace("root", {
    screen: stack,
    params: {
      screen: route,
      params: params,
    },
  });
}

export function push(navigation: StackNavigationProp<any, any>, stack: Stacks, route: Routes, params: any) {
  const p = { screen: route, params: params };
  console.log(`push to ${stack} with ${JSON.stringify(p)}`);
  return navigation.push(stack, p);
}

export function getParam(route: NavigationRoute, param: Params) {
  if (!route.params) {
    return undefined;
  }
  return route.params[param];
}
