import { default as React } from "react";
import { View, ViewStyle } from "react-native";
import { LAYOUT_STYLES } from "../styles/styles";

interface CenterProps {
  outerViewStyle?: ViewStyle;
  innewViewStyle?: ViewStyle;
}
export class Center extends React.PureComponent<CenterProps> {
  constructor(props: CenterProps) {
    super(props);
  }
  render() {
    return (
      <View style={[{}, this.props.outerViewStyle ? this.props.outerViewStyle : {}]}>
        <View style={[LAYOUT_STYLES.centerSelf, this.props.innewViewStyle ? this.props.innewViewStyle : {}]}>{this.props.children}</View>
      </View>
    );
  }
}
