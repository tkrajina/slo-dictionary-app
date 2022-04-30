import { default as React } from "react";
import { View, ViewStyle } from "react-native";
import { LAYOUT_STYLES } from "../styles/styles";

export function Center(props: { outerViewStyle?: ViewStyle, innewViewStyle?: ViewStyle, children: any }) {
    return (
      <View style={[{}, props.outerViewStyle ? props.outerViewStyle : {}]}>
        <View style={[LAYOUT_STYLES.centerSelf, props.innewViewStyle ? props.innewViewStyle : {}]}>{props.children}</View>
      </View>
    );
}
